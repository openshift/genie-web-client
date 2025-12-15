import React, { useEffect, useState } from 'react';
import { useMessages, useSetActiveConversation } from '@redhat-cloud-services/ai-react-state';
import {
  Chatbot,
  ChatbotContent,
  MessageBox,
  Message,
  ChatbotDisplayMode,
} from '@patternfly/chatbot';
import { useParams } from 'react-router-dom-v5-compat';
import { ChatLoading } from './ChatLoading';
import { ConversationNotFound } from './ConversationNotFound';
import { useChatBar } from '../ChatBarContext';

export const Chat: React.FunctionComponent = () => {
  const bottomRef = React.createRef<HTMLDivElement>();
  const messages = useMessages();
  const { conversationId } = useParams();
  const setActiveConversation = useSetActiveConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);
  const { setShowChatBar } = useChatBar();
  useEffect(() => {
    if (conversationId) {
      const setConversation = async () => {
        setIsLoading(true);
        try {
          await setActiveConversation(conversationId);
          setIsValidConversationId(true);
        } catch (error) {
          setIsValidConversationId(false);
        } finally {
          setIsLoading(false);
        }
      };

      setConversation();
    }
  }, [conversationId, setActiveConversation]);

  useEffect(() => {
    setShowChatBar(isValidConversationId);
  }, [isValidConversationId, setShowChatBar]);

  // Convert Red Hat Cloud Services messages to PatternFly format
  const formatMessages = () => {
    return messages.map((msg) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = msg as any; // Type assertion for Red Hat Cloud Services message format
      const isBot = message.role === 'bot';
      let content = message.answer || message.query || message.message || message.content || '';
      // console.log('content', content);
      content = content.split('=====The following is the user query that was asked:').pop();
      return (
        <Message
          key={msg.id}
          isLoading={!content}
          name={isBot ? 'Genie' : 'You'}
          isPrimary={!isBot}
          role={isBot ? 'bot' : 'user'}
          timestamp={new Date(
            message.timestamp || message.createdAt || Date.now(),
          ).toLocaleTimeString()}
          content={content}
        />
      );
    });
  };

  return (
    <Chatbot displayMode={ChatbotDisplayMode.embedded}>
      <ChatbotContent>
        <MessageBox>
          {isLoading && messages.length === 0 && <ChatLoading />}
          {!isValidConversationId && <ConversationNotFound />}
          {formatMessages()}
          <div ref={bottomRef}></div>
        </MessageBox>
      </ChatbotContent>
    </Chatbot>
  );
};
