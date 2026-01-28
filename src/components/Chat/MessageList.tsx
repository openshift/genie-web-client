import React, { useRef, useMemo } from 'react';
import { MessageBox } from '@patternfly/chatbot';
import type { Message } from '../../hooks/AIState';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useActiveConversation } from '../../hooks/AIState';
import type { GenieAdditionalProperties } from '../../types/chat';
import { ChatLoading } from './ChatLoading';
import { ConversationNotFound } from './ConversationNotFound';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { EditableChatHeader } from './EditableChatHeader';
import { getUserQuestionForBotMessage } from './feedback/utils';

// TODO: Remove this stub data after testing
const STUB_REFERENCED_DOCUMENTS = [
  {
    doc_url: 'https://docs.redhat.com/en/documentation/openshift_container_platform',
    doc_title: 'Red Hat OpenShift Documentation: Understanding OpenShift builds',
  },
  {
    doc_url:
      'https://docs.redhat.com/en/documentation/openshift_container_platform/troubleshooting',
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
    const {
      messages,
      streamingMessage,
      isStreaming,
      lastUserMessageIndex,
      lastBotMessageIndex,
      sendMessage,
    } = useChatMessages();
    const activeConversation = useActiveConversation();
    const conversationId = activeConversation?.id || '';
    const bottomRef = useRef<HTMLDivElement>(null);

    const renderedMessages = useMemo(() => {
      const streamingContent = streamingMessage?.content ?? '';

      return messages.map((message: Message<GenieAdditionalProperties>, index) => {
        const isBot = message.role !== 'user';

        if (isBot) {
          const isCurrentlyStreaming = isStreaming && index === lastBotMessageIndex;

          // If the message is currently streaming, use the throttled streaming content
          const messageToRender: Message<GenieAdditionalProperties> = isCurrentlyStreaming
            ? { ...message, answer: streamingContent }
            : message;

          // get the user question that precedes this bot message
          const userQuestionMessage = getUserQuestionForBotMessage(messages, message.id);
          const userQuestion = userQuestionMessage?.answer || '';

          return (
            <AIMessage
              key={`bot-${message.id}-${index}`}
              message={{
                ...messageToRender,
                // stub referencedDocuments for now
                additionalAttributes: {
                  ...messageToRender.additionalAttributes,
                  referencedDocuments: STUB_REFERENCED_DOCUMENTS,
                },
              }}
              conversationId={conversationId}
              userQuestion={userQuestion}
              onQuickResponse={sendMessage}
              isStreaming={isCurrentlyStreaming}
            />
          );
        }

        return (
          <UserMessage
            key={`user-${message.id}-${index}`}
            message={message}
            isLastUserMessage={index === lastUserMessageIndex}
          />
        );
      });
    }, [
      messages,
      conversationId,
      isStreaming,
      sendMessage,
      streamingMessage,
      lastUserMessageIndex,
      lastBotMessageIndex,
    ]);

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
