import { useCallback, useState, useContext } from 'react';
import { AIStateContext } from '@redhat-cloud-services/ai-react-state';
import type { Conversation } from './types';

type ClientWithFetch = {
  baseUrl?: string;
  fetchFunction?: typeof fetch;
};

/**
 * Return type of useDeleteConversation. Supports optimistic delete with undo:
 * remove from UI immediately, then either commit (DELETE API) or restore (undo).
 */
interface DeleteConversationResult {
  /** Remove conversation from state immediately; returns snapshot for possible restore (undo). */
  optimisticRemove: (conversationId: string) => Conversation | null;
  /** Put a previously removed conversation back (e.g. user clicked Undo in toast). */
  restoreConversation: (snapshot: Conversation) => void;
  /** Call DELETE API and wait for result; updates isDeleting/error. Use when user commits (toast dismissed or timeout). */
  performDeleteApi: (conversationId: string) => Promise<void>;
  /** Fire DELETE request with keepalive: true. Use on page unload so pending deletes still reach the server. */
  performDeleteApiKeepalive: (conversationId: string) => void;
  /** True while performDeleteApi is in progress. */
  isDeleting: boolean;
  /** Error message from the last performDeleteApi failure, or null. */
  error: string | null;
  /** Clear the current error (e.g. when user retries or closes modal). */
  clearError: () => void;
}

export const useDeleteConversation = (): DeleteConversationResult => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getState } = useContext(AIStateContext);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const optimisticRemove = useCallback(
    (conversationId: string): Conversation | null => {
      const stateManager = getState();
      const state = stateManager.getState();
      const snapshot = state.conversations[conversationId] as Conversation | undefined;
      if (!snapshot) return null;
      delete state.conversations[conversationId];
      if (state.activeConversationId === conversationId) {
        state.activeConversationId = null;
      }
      stateManager.notifyAll();
      return snapshot as Conversation;
    },
    [getState],
  );

  const restoreConversation = useCallback(
    (snapshot: Conversation) => {
      const stateManager = getState();
      const state = stateManager.getState();
      (state.conversations as Record<string, Conversation>)[snapshot.id] = snapshot as Conversation;
      stateManager.notifyAll();
    },
    [getState],
  );

  const getDeleteRequest = useCallback(
    (conversationId: string) => {
      const stateManager = getState();
      const client = stateManager.getClient() as ClientWithFetch;
      const fetchFn = client.fetchFunction || fetch;
      const baseUrl = client.baseUrl || '';
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = `${normalizedBaseUrl}v1/conversations/${conversationId}`;
      return { fetchFn, url };
    },
    [getState],
  );

  const performDeleteApi = useCallback(
    async (conversationId: string) => {
      setIsDeleting(true);
      setError(null);
      try {
        const { fetchFn, url } = getDeleteRequest(conversationId);
        const response = await fetchFn(url, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to delete conversation: ${response.statusText}`,
          );
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete conversation';
        setError(errorMessage);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [getDeleteRequest],
  );

  const performDeleteApiKeepalive = useCallback(
    (conversationId: string) => {
      const { fetchFn, url } = getDeleteRequest(conversationId);
      fetchFn(url, { method: 'DELETE', keepalive: true });
    },
    [getDeleteRequest],
  );

  return {
    optimisticRemove,
    restoreConversation,
    performDeleteApi,
    performDeleteApiKeepalive,
    isDeleting,
    error,
    clearError,
  };
};
