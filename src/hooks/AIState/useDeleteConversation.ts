import { useCallback, useState, useContext } from 'react';
import { AIStateContext } from '@redhat-cloud-services/ai-react-state';
import type { ClientWithFetch } from './types';

interface DeleteConversationResult {
  deleteConversation: (conversationId: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for deleting conversations through the API
 *
 * @returns object containing deleteConversation function, loading state, and error state
 */
export const useDeleteConversation = (): DeleteConversationResult => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getState } = useContext(AIStateContext);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      setIsDeleting(true);
      setError(null);

      try {
        const stateManager = getState();
        const client = stateManager.getClient() as ClientWithFetch;

        // preserve CSRF token handling by using the client's fetch function
        const fetchFn = client.fetchFunction || fetch;
        const baseUrl = client.baseUrl || '';
        const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const url = `${normalizedBaseUrl}v1/conversations/${conversationId}`;

        const response = await fetchFn(url, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to delete conversation: ${response.statusText}`,
          );
        }

        // sync local state: remove conversation and clear active if needed
        const state = stateManager.getState();
        delete state.conversations[conversationId];
        if (state.activeConversationId === conversationId) {
          state.activeConversationId = null;
        }
        stateManager.notifyAll();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete conversation';
        setError(errorMessage);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [getState],
  );

  return {
    deleteConversation,
    isDeleting,
    error,
    clearError,
  };
};
