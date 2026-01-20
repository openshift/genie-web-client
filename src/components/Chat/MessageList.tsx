import React, { useRef, useCallback, useMemo } from 'react';
import { MessageBox } from '@patternfly/chatbot';
import type { Message } from '../../hooks/AIState';
import {
  useMessages,
  useSendStreamMessage,
  useStreamChunk,
  useInProgress,
  useActiveConversation,
} from '../../hooks/AIState';
import { ChatLoading } from './ChatLoading';
import { ConversationNotFound } from './ConversationNotFound';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { useToolCalls } from './useToolCalls';
import { GenieAdditionalProperties } from 'src/types/chat';
import { EditableChatHeader } from './EditableChatHeader';
import { getUserQuestionForBotMessage } from './messageHelpers';

interface MessageListProps {
  isLoading: boolean;
  isValidConversationId: boolean;
}

// eslint-disable-next-line react/display-name
export const MessageList: React.FC<MessageListProps> = React.memo(
  // eslint-disable-next-line react/prop-types
  ({ isLoading, isValidConversationId }) => {
    const messages = useMessages();
    const sendStreamMessage = useSendStreamMessage();
    const streamChunk = useStreamChunk<GenieAdditionalProperties>();
    const { toolCallsByMessage } = useToolCalls(streamChunk);
    const inProgress = useInProgress();
    const activeConversation = useActiveConversation();
    const conversationId = activeConversation?.id || '';
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
            // only the last bot message can be streaming
            const isStreaming = inProgress && index === lastBotMessageIndex;
            // use role + message.id + index as key to ensure uniqueness
            // (message.id can be duplicated between user/bot in same conversation)
            const toolCalls = toolCallsByMessage[message.id];
            const userQuestion = getUserQuestionForBotMessage(messages, index);
            return (
              <AIMessage
                key={`bot-${message.id}-${index}`}
                message={message}
                conversationId={conversationId}
                userQuestion={userQuestion}
                onQuickResponse={handleQuickResponse}
                isStreaming={isStreaming}
                toolCalls={toolCalls}
              />
            );
          }

          // use role + message.id + index as key to ensure uniqueness
          return (
            <UserMessage
              key={`user-${message.id}-${index}`}
              message={message}
              isLastUserMessage={index === lastUserMessageIndex}
            />
          );
        }),
      [
        messages,
        handleQuickResponse,
        lastUserMessageIndex,
        lastBotMessageIndex,
        inProgress,
        toolCallsByMessage,
      ],
    );

    return (
      <MessageBox>
        <EditableChatHeader />
        {isLoading && messages.length === 0 ? <ChatLoading /> : null}
        {!isValidConversationId ? <ConversationNotFound /> : null}
        {renderedMessages}
        <div ref={bottomRef}></div>
      </MessageBox>
    );
  },
);
