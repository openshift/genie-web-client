import type { Message } from '../../../hooks/AIState';

// Helper function to find the preceding user message for a given bot message
export const getUserQuestionForBotMessage = (
  messages: Message[],
  botMessageId: string,
): Message | undefined => {
  const messageIndex = messages.findIndex((msg) => msg.id === botMessageId && msg.role === 'bot');

  if (messageIndex === -1) {
    return undefined;
  }

  // Look backwards through messages to find the first user message
  for (let i = messageIndex - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      return messages[i];
    }
  }

  return undefined;
};
