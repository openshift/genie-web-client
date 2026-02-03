import { useCallback, useState } from 'react';
import type { Conversation } from './types';
import { useDeleteConversation } from './useDeleteConversation';

export type ConversationForDelete = Pick<Conversation, 'id' | 'title'>;

export interface UseDeleteConversationModalOptions {
  /** Called after a successful delete with the deleted conversation id (e.g. close drawer, navigate if it was the active conversation) */
  onDeleted?: (deletedConversationId: string) => void;
}

export interface UseDeleteConversationModalResult {
  conversationToDelete: ConversationForDelete | null;
  openDeleteModal: (conversation: ConversationForDelete) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
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
  const { deleteConversation, isDeleting, error, clearError } = useDeleteConversation();

  const openDeleteModal = useCallback((conversation: ConversationForDelete) => {
    setConversationToDelete(conversation);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setConversationToDelete(null);
    clearError();
  }, [clearError]);

  const confirmDelete = useCallback(async () => {
    if (!conversationToDelete) return;
    const id = conversationToDelete.id;
    try {
      await deleteConversation(id);
      setConversationToDelete(null);
      onDeleted?.(id);
    } catch (err) {
      // Error is tracked by useDeleteConversation; modal stays open
      console.error('Failed to delete conversation:', err);
    }
  }, [conversationToDelete, deleteConversation, onDeleted]);

  return {
    conversationToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    isDeleting,
    error,
  };
}
