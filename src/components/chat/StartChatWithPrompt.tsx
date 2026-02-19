import React, { useEffect } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useCreateNewConversation, useSendStreamMessage } from '../../hooks/AIState';
import { useNavigate, useSearchParams } from 'react-router-dom-v5-compat';
import { mainGenieRoute, SubRoutes, START_CHAT_PROMPT_PARAM } from '../routeList';

/** Delay (ms) before navigating to chat after sending the prompt, so the message is enqueued. */
const NAVIGATE_AFTER_SEND_DELAY_MS = 150;

/**
 * Route component: "start a new chat with a prompt, then go to chat."
 * Reads `prompt` from the URL (query param), creates a new conversation, streams the
 * message, and navigates to the chat route. Reusable for any button that should
 * start a new chat with a fixed prompt (e.g. "Create new dashboard", "Help me automate").
 * Shows a spinner while running.
 */
export const StartChatWithPrompt: React.FC = () => {
  const [searchParams] = useSearchParams();
  const createNewConversation = useCreateNewConversation();
  const sendStreamMessage = useSendStreamMessage();
  const navigate = useNavigate();

  useEffect(() => {
    const prompt = searchParams.get(START_CHAT_PROMPT_PARAM);
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`, { replace: true });
      return;
    }

    let cancelled = false;
    const targetPath = `${mainGenieRoute}/${SubRoutes.Chat}`;

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      const run = async () => {
        await createNewConversation();
        if (cancelled) return;
        sendStreamMessage(prompt.trim());
        if (cancelled) return;
        setTimeout(() => {
          if (!cancelled) navigate(targetPath);
        }, NAVIGATE_AFTER_SEND_DELAY_MS);
      };
      run();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // Intentionally run once on mount; prompt is read from URL at that time.
  }, []);

  return (
    <Bullseye className="pf-v6-u-h-100">
      <Spinner size="xl" aria-label="Starting chat" />
    </Bullseye>
  );
};
