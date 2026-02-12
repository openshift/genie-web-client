import { useCallback, useEffect, useRef, useState } from 'react';
import type { Conversation } from './types';
import { useDeleteConversation } from './useDeleteConversation';

export type ConversationForDelete = Pick<Conversation, 'id' | 'title'>;

interface PendingDelete {
  snapshot: Conversation;
}

export interface OnDeletedHelpers {
  undoDelete: (conversationId: string) => void;
  commitDelete: (conversationId: string) => void;
}

export interface UseDeleteConversationModalOptions {
  onDeleted?: (deletedConversationId: string, helpers: OnDeletedHelpers) => void;
}

export interface UseDeleteConversationModalResult {
  conversationToDelete: ConversationForDelete | null;
  openDeleteModal: (conversation: ConversationForDelete) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  undoDelete: (conversationId: string) => void;
  commitDelete: (conversationId: string) => void;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteConversationModal(
  options: UseDeleteConversationModalOptions = {},
): UseDeleteConversationModalResult {
  const { onDeleted } = options;
  const [conversationToDelete, setConversationToDelete] = useState<ConversationForDelete | null>(
    null,
  );
  const pendingDeletesRef = useRef<Map<string, PendingDelete>>(new Map());
  const {
    optimisticRemove,
    restoreConversation,
    performDeleteApi,
    performDeleteApiKeepalive,
    isDeleting,
    error,
    clearError,
  } = useDeleteConversation();

  const openDeleteModal = useCallback((conversation: ConversationForDelete) => {
    setConversationToDelete(conversation);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setConversationToDelete(null);
    clearError();
  }, [clearError]);

  const commitDelete = useCallback(
    (conversationId: string) => {
      const pending = pendingDeletesRef.current.get(conversationId);
      if (pending) {
        pendingDeletesRef.current.delete(conversationId);
        performDeleteApi(conversationId).catch((err) =>
          console.error('Failed to commit delete:', err),
        );
      }
    },
    [performDeleteApi],
  );

  const undoDelete = useCallback(
    (conversationId: string) => {
      const pending = pendingDeletesRef.current.get(conversationId);
      if (pending) {
        pendingDeletesRef.current.delete(conversationId);
        restoreConversation(pending.snapshot);
      }
    },
    [restoreConversation],
  );

  const confirmDelete = useCallback((): Promise<void> => {
    if (!conversationToDelete) return Promise.resolve();
    const id = conversationToDelete.id;
    const snapshot = optimisticRemove(id);
    setConversationToDelete(null);

    if (!snapshot) {
      return Promise.resolve();
    }

    pendingDeletesRef.current.set(id, { snapshot });
    onDeleted?.(id, { undoDelete, commitDelete });
    return Promise.resolve();
  }, [conversationToDelete, optimisticRemove, onDeleted]);

  useEffect(() => {
    const handlePageHide = () => {
      pendingDeletesRef.current.forEach((_pending, conversationId) => {
        performDeleteApiKeepalive(conversationId);
      });
      pendingDeletesRef.current.clear();
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [performDeleteApiKeepalive]);

  return {
    conversationToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    undoDelete,
    commitDelete,
    isDeleting,
    error,
  };
}
