import { AlertActionCloseButton, Button } from '@patternfly/react-core';
import type { ToastAlert } from '../toast-alerts/ToastAlertProvider';
import type { OnDeletedHelpers } from '../../hooks/AIState';

export interface ShowDeleteConversationToastOptions {
  addAlert: (alert: ToastAlert) => void;
  removeAlert: (alert: Pick<ToastAlert, 'id'>) => void;
  undoDelete: (conversationId: string) => void;
  commitDelete: (conversationId: string) => void;
  t: (key: string) => string;
}

export interface CreateOnDeletedHandlerOptions {
  navigate: (path: string, opts?: { replace?: boolean }) => void;
  newChatPath: string;
  activeConversationId?: string;
  conversationsCount: number;
  addAlert: (alert: ToastAlert) => void;
  removeAlert: (alert: Pick<ToastAlert, 'id'>) => void;
  t: (key: string) => string;
  closeDrawer?: () => void;
  pathname?: string;
}

export function createOnDeletedHandler(
  options: CreateOnDeletedHandlerOptions,
): (deletedId: string, helpers: OnDeletedHelpers) => void {
  const {
    navigate,
    newChatPath,
    activeConversationId,
    conversationsCount,
    closeDrawer,
    pathname,
    addAlert,
    removeAlert,
    t,
  } = options;
  return (deletedId: string, { undoDelete, commitDelete }: OnDeletedHelpers) => {
    closeDrawer?.();
    const wasActive = activeConversationId === deletedId;
    const wasLast = conversationsCount === 1;
    const alreadyOnNewChat = pathname !== undefined && pathname.endsWith(newChatPath);
    if (!alreadyOnNewChat && (wasActive || wasLast)) {
      navigate(newChatPath, { replace: true });
    }
    showDeleteConversationToast(deletedId, {
      addAlert,
      removeAlert,
      undoDelete,
      commitDelete,
      t,
    });
  };
}

export function showDeleteConversationToast(
  deletedId: string,
  { addAlert, removeAlert, undoDelete, commitDelete, t }: ShowDeleteConversationToastOptions,
): void {
  const toastId = `delete-toast-${deletedId}`;
  const commit = () => commitDelete(deletedId);
  addAlert({
    id: toastId,
    variant: 'success',
    title: t('chat.deleteToast.title'),
    children: t('chat.deleteToast.description'),
    actionLinks: (
      <Button
        variant="secondary"
        onClick={() => {
          undoDelete(deletedId);
          removeAlert({ id: toastId });
        }}
      >
        {t('chat.deleteToast.undo')}
      </Button>
    ),
    actionClose: (
      <AlertActionCloseButton
        onClose={() => {
          commit();
          removeAlert({ id: toastId });
        }}
      />
    ),
    timeout: true,
    onTimeout: commit,
  });
}
