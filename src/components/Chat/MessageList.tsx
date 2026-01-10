import React, { useRef, useCallback, useMemo } from 'react';
import { MessageBox } from '@patternfly/chatbot';
import type { Message } from '../../hooks/AIState';
import {
  useMessages,
  useSendStreamMessage,
  useStreamChunk,
  useInProgress,
} from '../../hooks/AIState';
import type { LightSpeedCoreAdditionalProperties } from '../../hooks/AIState';
import { ChatLoading } from './ChatLoading';
import { ConversationNotFound } from './ConversationNotFound';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { useToolCalls } from './useToolCalls';

interface MessageListProps {
  isLoading: boolean;
  isValidConversationId: boolean;
}

export const MessageList: React.FC<MessageListProps> = React.memo(
  ({ isLoading, isValidConversationId }) => {
    const messages = useMessages();
    const sendStreamMessage = useSendStreamMessage();
    const streamChunk =
      useStreamChunk<LightSpeedCoreAdditionalProperties>();
    const { toolCallsByMessage } = useToolCalls(streamChunk);
    const inProgress = useInProgress();
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleQuickResponse = useCallback(
      (text: string) => sendStreamMessage(text),
      [sendStreamMessage],
    );

    // Find the last user message index for edit functionality
    const lastUserMessageIndex = useMemo(() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role !== 'bot') {
          return i;
        }
      }
      return -1;
    }, [messages]);

    // Find the last bot message index for streaming indicator
    const lastBotMessageIndex = useMemo(() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'bot') {
          return i;
        }
      }
      return -1;
    }, [messages]);

    const renderedMessages = useMemo(
      () =>
        messages.map((message: Message, index) => {
          const isBot = message.role === 'bot';

          if (isBot) {
            // Only the last bot message can be streaming
            const isStreaming = inProgress && index === lastBotMessageIndex;
            return (
              <AIMessage
                key={message.id}
                message={message}
                onQuickResponse={handleQuickResponse}
                isStreaming={isStreaming}
                toolCalls={toolCallsByMessage[message.id]}
              />
            );
          }

          return (
            <UserMessage
              key={message.id}
              message={message}
              isLastUserMessage={index === lastUserMessageIndex}
            />
          );
        }),
      [messages, handleQuickResponse, lastUserMessageIndex, lastBotMessageIndex, inProgress],
    );

    return (
      <MessageBox>
        {isLoading && messages.length === 0 ? <ChatLoading /> : null}
        {!isValidConversationId ? <ConversationNotFound /> : null}
        {renderedMessages}
        <div ref={bottomRef}></div>
      </MessageBox>
    );
  },
);
