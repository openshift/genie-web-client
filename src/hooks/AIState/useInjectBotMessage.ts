import { useCallback, useContext } from 'react';
import { AIStateContext } from '@redhat-cloud-services/ai-react-state';
import type { GenieAdditionalProperties } from '../../components/new-chat/suggestions';

export interface InjectBotMessageOptions {
  answer: string;
  additionalAttributes?: GenieAdditionalProperties;
}

/**
 * Hook to inject a bot message directly into the conversation state
 * without calling the LLM API. This is useful for pre-defined responses
 * like suggestion prompts with quick response buttons.
 *
 * @returns Function to inject a bot message into the active conversation
 */
export function useInjectBotMessage(): (options: InjectBotMessageOptions) => void {
  const { getState } = useContext(AIStateContext);

  return useCallback(
    (options: InjectBotMessageOptions) => {
      const stateManager = getState();
      const state = stateManager.getState();

      // Get or create active conversation
      let conversationId = state.activeConversationId;
      if (!conversationId) {
        // Create a temporary conversation if none exists
        conversationId = '__temp_conversation__';
        // Initialize conversation in state
        state.conversations[conversationId] = {
          id: conversationId,
          title: 'New conversation',
          messages: [],
          locked: false,
          createdAt: new Date(),
        };
        state.activeConversationId = conversationId;
      }

      const conversation = state.conversations[conversationId];
      if (!conversation) {
        console.error('No active conversation found');
        return;
      }

      // Create and push the bot message
      const botMessage = {
        id: crypto.randomUUID(),
        answer: options.answer,
        role: 'bot' as const,
        date: new Date(),
        additionalAttributes: options.additionalAttributes as Record<string, unknown>,
      };

      conversation.messages.push(botMessage);

      // Notify all subscribers to trigger re-render
      stateManager.notifyAll();
    },
    [getState],
  );
}

