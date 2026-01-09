import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  useMessages,
  useSendMessage,
  useStreamChunk,
  useInProgress,
} from '@redhat-cloud-services/ai-react-state';
import { MessageBox } from '@patternfly/chatbot';
import {
  LightSpeedCoreAdditionalProperties,
  ToolResultEvent,
} from '@redhat-cloud-services/lightspeed-client';
import DynamicComponent from '@rhngui/patternfly-react-renderer';
import { ChatLoading } from './ChatLoading';
import { ConversationNotFound } from './ConversationNotFound';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { useToolCalls } from './useToolCalls';

function isGenerateUIEvent(token: any) {
  return token?.tool_name?.startsWith?.('generate_ui') && token?.response;
}

function parseGenerateUIResponse(response: string): React.ReactNode[] {
  try {
    const parsedResponse = JSON.parse(response);
    return (
      parsedResponse?.blocks?.map((block: any) => {
        const content = JSON.parse(block.rendering.content);
        return <DynamicComponent key="dynamic-component" config={content} />;
      }) || []
    );
  } catch (e) {
    console.error('Failed to parse or render UI component', e);
    return [];
  }
}

function handleToolResult(
  toolResult: ToolResultEvent,
  messageId: string,
  setUiComponents: React.Dispatch<
    React.SetStateAction<Record<string, React.ReactNode[]>>
  >,
) {
  const token = toolResult.data?.token as any;
  if (isGenerateUIEvent(token)) {
    const components = parseGenerateUIResponse(token?.response);
    if (components.length > 0 && messageId) {
      setUiComponents((prev) => ({
        ...prev,
        [messageId]: [components[components.length - 1]],
      }));
    }
  }
}

interface MessageListProps {
  isLoading: boolean;
  isValidConversationId: boolean;
}

export const MessageList: React.FC<MessageListProps> = React.memo(
  ({ isLoading, isValidConversationId }) => {
    const [components, setComponents] = useState<
      Record<string, React.ReactNode[]>
    >({});
    const messages = useMessages();
    const sendMessage = useSendMessage();
    const streamChunk =
      useStreamChunk<LightSpeedCoreAdditionalProperties>();
    const { toolCallsByMessage } = useToolCalls(streamChunk);
    const inProgress = useInProgress();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (
        streamChunk?.additionalAttributes?.toolResults &&
        streamChunk.messageId
      ) {
        streamChunk.additionalAttributes.toolResults.forEach((toolResult) => {
          handleToolResult(
            toolResult as ToolResultEvent,
            streamChunk.messageId,
            setComponents,
          );
        });
      }
    }, [streamChunk]);

    const handleQuickResponse = useCallback(
      (text: string) => sendMessage(text, { stream: true }),
      [sendMessage],
    );

    // Find the last user message index for edit functionality
    const lastUserMessageIndex = useMemo(() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if ((messages[i] as any).role !== 'bot') {
          return i;
        }
      }
      return -1;
    }, [messages]);

    // Find the last bot message index for streaming indicator
    const lastBotMessageIndex = useMemo(() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if ((messages[i]).role === 'bot') {
          return i;
        }
      }
      return -1;
    }, [messages]);

    const renderedMessages = useMemo(
      () =>
        messages.map((msg, index) => {
          // TODO: Add type for message
          const message = msg as any;
          const isBot = message.role === 'bot';

          if (isBot) {
            // Only the last bot message can be streaming
            const isStreaming = inProgress && index === lastBotMessageIndex;
            return (
              <AIMessage
                key={msg.id}
                message={message}
                extraContent={components[msg.id]}
                onQuickResponse={handleQuickResponse}
                isStreaming={isStreaming}
                toolCalls={toolCallsByMessage[msg.id]}
              />
            );
          }

          return (
            <UserMessage
              key={msg.id}
              message={message}
              isLastUserMessage={index === lastUserMessageIndex}
            />
          );
        }),
      [messages, components, handleQuickResponse, lastUserMessageIndex, lastBotMessageIndex, inProgress, toolCallsByMessage],
    );

    return (
      <MessageBox>
        {isLoading && messages.length === 0 && <ChatLoading />}
        {!isValidConversationId && <ConversationNotFound />}
        {renderedMessages}
        <div ref={bottomRef}></div>
      </MessageBox>
    );
  },
);

MessageList.displayName = 'MessageList';

