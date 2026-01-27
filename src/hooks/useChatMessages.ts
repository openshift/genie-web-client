import { useCallback, useMemo } from 'react';
import type { Message } from './AIState';
import { useMessages, useStreamChunk, useInProgress, useSendStreamMessage } from './AIState';
import type { GenieAdditionalProperties } from '../types/chat';
import { useThrottle } from './useThrottle';
export { getToolCallsFromMessage } from '../utils/toolCallHelpers';

const STREAMING_THROTTLE_MS = 50;

export interface StreamingMessage {
  messageId: string;
  content: string;
}

export interface UseChatMessagesReturn {
  messages: Message<GenieAdditionalProperties>[];
  streamingMessage: StreamingMessage | null;
  isStreaming: boolean;
  sendMessage: (text: string) => void;
  lastUserMessageIndex: number;
  lastBotMessageIndex: number;
}

/**
 * Hook to get the messages and streaming message from the server.
 * Throttles the streaming message to avoid excessive re-renders.
 *
 * @see useThrottle
 * @returns UseChatMessagesReturn
 * @property messages - The messages in the conversation.
 * @property streamingMessage - The streaming message from the server.
 * @property isStreaming - Whether the conversation is in progress.
 * @property sendMessage - The function to send a message to the server.
 * @property lastUserMessageIndex - The index of the last user message.
 * @property lastBotMessageIndex - The index of the last bot message.
 */
export function useChatMessages(): UseChatMessagesReturn {
  const messages = useMessages() as Message<GenieAdditionalProperties>[];
  const rawStreamChunk = useStreamChunk<GenieAdditionalProperties>();
  const inProgress = useInProgress();
  const sendStreamMessage = useSendStreamMessage();

  const sendMessage = useCallback((text: string) => sendStreamMessage(text), [sendStreamMessage]);

  const lastUserMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i;
    }
    return -1;
  }, [messages]);

  const lastBotMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role !== 'user') return i;
    }
    return -1;
  }, [messages]);

  const rawStreamingMessage = useMemo<StreamingMessage | null>(() => {
    if (!inProgress || !rawStreamChunk?.messageId) return null;

    return {
      messageId: rawStreamChunk.messageId,
      content: rawStreamChunk.answer ?? '',
    };
  }, [inProgress, rawStreamChunk]);

  // Streaming message updates at most every 50ms to avoid excessive re-renders.
  const streamingMessage = useThrottle(rawStreamingMessage, STREAMING_THROTTLE_MS);

  return {
    messages,
    streamingMessage,
    isStreaming: inProgress,
    sendMessage,
    lastUserMessageIndex,
    lastBotMessageIndex,
  };
}
