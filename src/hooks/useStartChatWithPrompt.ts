import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getStartChatWithPromptUrl } from '../components/routeList';

/**
 * Returns a function that navigates to the "start chat with prompt" route.
 * That route creates a new conversation, streams the given message, and redirects to chat.
 * Use for any button that should start a new chat with a fixed prompt (e.g. "Create new
 * dashboard", "Help me troubleshoot").
 *
 * @example
 * const startChatWithPrompt = useStartChatWithPrompt();
 * <Button onClick={() => startChatWithPrompt('Can you help me create a new dashboard?')}>
 *   Create dashboard
 * </Button>
 */
export function useStartChatWithPrompt(): (prompt: string) => void {
  const navigate = useNavigate();
  return useCallback(
    (prompt: string) => {
      navigate(getStartChatWithPromptUrl(prompt));
    },
    [navigate],
  );
}
