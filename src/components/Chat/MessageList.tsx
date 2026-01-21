import React, { useRef, useMemo } from 'react';
import { MessageBox } from '@patternfly/chatbot';
import type { Message } from '../../hooks/AIState';
import { useChatMessages, getToolCallsFromMessage } from '../../hooks/useChatMessages';
import type { GenieAdditionalProperties } from '../../types/chat';
import { ChatLoading } from './ChatLoading';
import { ConversationNotFound } from './ConversationNotFound';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { EditableChatHeader } from './EditableChatHeader';

// TODO: Remove this stub data after testing
const STUB_REFERENCED_DOCUMENTS = [
  {
    doc_url: 'https://docs.redhat.com/en/documentation/openshift_container_platform',
    doc_title: 'Red Hat OpenShift Documentation: Understanding OpenShift builds',
  },
  {
    doc_url: 'https://docs.redhat.com/en/documentation/openshift_container_platform/troubleshooting',
    doc_title: 'KCS Article #6985012: Troubleshooting CrashLoopBackOff',
  },
  {
    doc_url: 'https://docs.redhat.com/en/documentation/openshift_container_platform/blog',
    doc_title: 'Red Hat Blog: A Guide to OpenShift Security Best Practices',
  },
  {
    doc_url: 'https://docs.redhat.com/en/documentation/openshift_commons',
    doc_title: 'OpenShift Commons Briefing: Security and Compliance',
  },
  {
    doc_url: 'https://docs.redhat.com/en/documentation/rhel',
    doc_title: 'Red Hat Enterprise Linux (RHEL) Documentation',
  },
];

interface MessageListProps {
  isLoading: boolean;
  isValidConversationId: boolean;
}

// eslint-disable-next-line react/display-name
export const MessageList: React.FC<MessageListProps> = React.memo(
  // eslint-disable-next-line react/prop-types
  ({ isLoading, isValidConversationId }) => {
    const { messages, streamingMessage, isStreaming, sendMessage } = useChatMessages();

    const bottomRef = useRef<HTMLDivElement>(null);

    const renderedMessages = useMemo(() => {
      const streamingContent = streamingMessage?.content ?? '';
      const streamingToolCalls = streamingMessage?.toolCalls ?? [];

      // Find the last user and bot message indices
      let lastUserIdx = -1;
      let lastBotIdx = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (lastUserIdx === -1 && messages[i].role !== 'bot') lastUserIdx = i;
        if (lastBotIdx === -1 && messages[i].role === 'bot') lastBotIdx = i;
        if (lastUserIdx !== -1 && lastBotIdx !== -1) break;
      }

      return messages.map((message: Message<GenieAdditionalProperties>, index) => {
        const isBot = message.role === 'bot';

        if (isBot) {
          const isCurrentlyStreaming = isStreaming && index === lastBotIdx;

          // If the message is currently streaming, use the streaming content and tool calls
          // Otherwise, use the message content and tool calls
          // TODO: Remove stub referencedDocuments after testing
          const isLastBotMessage = index === lastBotIdx;
          const messageToRender: Message<GenieAdditionalProperties> = isCurrentlyStreaming
            ? { ...message, answer: streamingContent }
            : isLastBotMessage
              ? {
                  ...message,
                  additionalAttributes: {
                    ...message.additionalAttributes,
                    referencedDocuments: STUB_REFERENCED_DOCUMENTS,
                  },
                }
              : message;

          // If the message is currently streaming, use the streaming tool calls
          // Otherwise, use the tool calls from the message
          const toolCalls = isCurrentlyStreaming
            ? streamingToolCalls
            : getToolCallsFromMessage(message);

          return (
            <AIMessage
              key={`bot-${message.id}-${index}`}
              message={messageToRender}
              onQuickResponse={sendMessage}
              isStreaming={isCurrentlyStreaming}
              toolCalls={toolCalls}
            />
          );
        }

        return (
          <UserMessage
            key={`user-${message.id}-${index}`}
            message={message}
            isLastUserMessage={index === lastUserIdx}
          />
        );
      });
    }, [messages, isStreaming, sendMessage, streamingMessage]);

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
