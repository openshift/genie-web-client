import { useCallback, useContext } from 'react';
import { AlertVariant } from '@patternfly/react-core';
import { AIStateContext } from '@redhat-cloud-services/ai-react-state';
import { useTranslation } from 'react-i18next';
import { useToastAlerts } from '../../components/toast-alerts/ToastAlertProvider';
import { useSendStreamMessage } from './messageHooks';

/**
 * Handles editing of the last user message without backend support for message deletion.
 * Frontend visually hides the original message and AI response, then sends the edited
 * content as a new turn. Backend retains full history.
 */
export function useEditMessage(): (editedContent: string) => void {
  const { getState } = useContext(AIStateContext);
  const sendStreamMessage = useSendStreamMessage();
  const { addAlert } = useToastAlerts();
  const { t } = useTranslation('plugin__genie-web-client');

  const reportEditError = useCallback(
    (message: string) => {
      // guard to avoid silent failure when state isn't ready yet
      console.error(message);
      addAlert({
        id: `edit-message-error-${Date.now()}`,
        title: t('message.edit.error.title'),
        variant: AlertVariant.danger,
        children: t('message.edit.error.description'),
      });
    },
    [addAlert, t],
  );

  return useCallback(
    (editedContent: string) => {
      const stateManager = getState();
      const state = stateManager.getState();
      const conversationId = state.activeConversationId;

      if (!conversationId) {
        reportEditError('No active conversation found');
        return;
      }

      const conversation = state.conversations[conversationId];
      if (!conversation) {
        reportEditError('Active conversation not found in state');
        return;
      }

      const messages = conversation.messages;
      let lastUserMessageIndex = -1;

      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserMessageIndex = i;
          break;
        }
      }

      if (lastUserMessageIndex === -1) {
        reportEditError('No user message found to edit');
        return;
      }

      // frontend-only workaround since backend doesn't support message deletion
      for (let i = lastUserMessageIndex; i < messages.length; i++) {
        const message = messages[i];
        if (!message.additionalAttributes) {
          message.additionalAttributes = {};
        }
        // type assertion needed: adding hidden flag outside typed interface for frontend-only filtering
        (message.additionalAttributes as Record<string, unknown>).hidden = true;
      }

      stateManager.notifyAll();
      sendStreamMessage(editedContent);
    },
    [getState, sendStreamMessage, reportEditError],
  );
}
