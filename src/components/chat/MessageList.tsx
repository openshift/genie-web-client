import React, { useMemo, useRef, useEffect } from 'react';
import { MessageBox, type MessageBoxHandle } from '@patternfly/chatbot';
import type { Message } from '../../hooks/AIState';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useActiveConversation, useEditMessage } from '../../hooks/AIState';
import type { GenieAdditionalProperties } from '../../types/chat';
import { ChatLoading } from './ChatLoading';
import { ConversationNotFound } from './ConversationNotFound';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { getUserQuestionForBotMessage } from './feedback/utils';
import { EditableChatHeader } from './EditableChatHeader';

// TODO: remove this stub data after testing
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
    const { messages, streamingMessage, isStreaming, sendMessage } = useChatMessages();
    const activeConversation = useActiveConversation();
    const conversationId = activeConversation?.id || '';
    const editMessage = useEditMessage();
    const messageBoxRef = useRef<MessageBoxHandle>(null);
    const isInitialLoadRef = useRef(true);
    const previousMessagesLengthRef = useRef(0);

    const visibleMessages = useMemo(
      () => messages.filter((msg) => !msg.additionalAttributes?.hidden),
      [messages],
    );

    const lastVisibleUserMessageIndex = useMemo(() => {
      for (let i = visibleMessages.length - 1; i >= 0; i--) {
        if (visibleMessages[i].role === 'user') return i;
      }
      return -1;
    }, [visibleMessages]);

    const renderedMessages = useMemo(() => {
      const streamingContent = streamingMessage?.content ?? '';

      return visibleMessages.map((message: Message<GenieAdditionalProperties>, index) => {
        const isBot = message.role !== 'user';

        if (isBot) {
          const isCurrentlyStreaming = isStreaming && message.id === streamingMessage?.messageId;

          const messageToRender: Message<GenieAdditionalProperties> = isCurrentlyStreaming
            ? { ...message, answer: streamingContent }
            : message;

          const userQuestionMessage = getUserQuestionForBotMessage(visibleMessages, message.id);
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
            isLastUserMessage={index === lastVisibleUserMessageIndex}
            onEditMessage={editMessage}
          />
        );
      });
    }, [
      conversationId,
      isStreaming,
      sendMessage,
      streamingMessage,
      editMessage,
      visibleMessages,
      lastVisibleUserMessageIndex,
    ]);

    // Handle initial load: Jump immediately to bottom with no animation
    useEffect(() => {
      if (isInitialLoadRef.current && messages.length > 0 && messageBoxRef.current) {
        // Instant jump to bottom for historical data
        messageBoxRef.current.scrollToBottom({ behavior: 'auto', resumeSmartScroll: true });
        isInitialLoadRef.current = false;
        previousMessagesLengthRef.current = messages.length;
      }
    }, [messages.length]);

    // Reset initial load flag when conversation changes
    useEffect(() => {
      isInitialLoadRef.current = true;
      previousMessagesLengthRef.current = 0;
    }, [conversationId]);

    // Handle new message: Smooth scroll when user sends a message
    useEffect(() => {
      const hasNewMessage = messages.length > previousMessagesLengthRef.current;

      if (hasNewMessage && !isInitialLoadRef.current && messageBoxRef.current) {
        // Smooth scroll for new messages
        messageBoxRef.current.scrollToBottom({ behavior: 'smooth', resumeSmartScroll: true });
        previousMessagesLengthRef.current = messages.length;
      }
    }, [messages.length]);

    // Handle LLM streaming: Auto-scroll only if user is at bottom (sticky-bottom logic)
    useEffect(() => {
      if (isStreaming && streamingMessage?.content && messageBoxRef.current) {
        // PatternFly's scrollToBottom will automatically check if user has scrolled up
        // If pauseAutoScrollRef is true (user scrolled up), it won't scroll
        // This implements the "sticky-bottom" logic automatically
        // Use 'auto' for instant scroll during streaming to avoid animation lag
        messageBoxRef.current.scrollToBottom({ behavior: 'auto', resumeSmartScroll: false });
      }
    }, [streamingMessage?.content, isStreaming]);

    return (
      <MessageBox ref={messageBoxRef} enableSmartScroll={true}>
        <EditableChatHeader />
        {isLoading && messages.length === 0 ? <ChatLoading /> : null}
        {!isValidConversationId ? <ConversationNotFound /> : null}
        {renderedMessages}
      </MessageBox>
    );
  },
);
