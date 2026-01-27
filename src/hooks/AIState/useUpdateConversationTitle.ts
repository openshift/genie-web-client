import { useCallback, useState, useContext } from 'react';
import { AIStateContext } from '@redhat-cloud-services/ai-react-state';

interface UpdateConversationTitleResult {
  updateTitle: (conversationId: string, newTitle: string) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
  clearError: () => void;
}

type ClientWithFetch = {
  baseUrl?: string;
  fetchFunction?: typeof fetch;
};

/**
 * Custom hook for updating conversation titles through the API
 *
 * @returns object containing updateTitle function, loading state, and error state
 */
export const useUpdateConversationTitle = (): UpdateConversationTitleResult => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getState } = useContext(AIStateContext);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateTitle = useCallback(
    async (conversationId: string, newTitle: string) => {
      setIsUpdating(true);
      setError(null);

      try {
        const stateManager = getState();
        const client = stateManager.getClient() as ClientWithFetch;

        // preserve CSRF token handling by using the client's fetch function
        const fetchFn = client.fetchFunction || fetch;
        const baseUrl = client.baseUrl || '';
        const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const url = `${normalizedBaseUrl}v2/conversations/${conversationId}`;

        const response = await fetchFn(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic_summary: newTitle,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to update conversation title: ${response.statusText}`,
          );
        }

        // sync local state with the updated title
        const state = stateManager.getState();
        const conversation = state.conversations[conversationId];
        if (conversation) {
          conversation.title = newTitle;
          stateManager.notifyAll();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update conversation title';
        setError(errorMessage);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [getState],
  );

  return {
    updateTitle,
    isUpdating,
    error,
    clearError,
  };
};
