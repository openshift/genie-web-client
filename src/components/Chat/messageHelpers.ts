import type { Message } from '../../hooks/AIState';

/**
 * Find the user question that precedes a bot message
 * @param messages - All messages in the conversation
 * @param botMessageIndex - Index of the bot message
 * @returns The user question text, or empty string if not found
 */
export const getUserQuestionForBotMessage = (
  messages: Message[],
  botMessageIndex: number,
): string => {
  // look backwards to find the user message before this bot message
  for (let i = botMessageIndex - 1; i >= 0; i--) {
    if (messages[i].role !== 'bot') {
      return messages[i].answer || '';
    }
  }
  return '';
};
