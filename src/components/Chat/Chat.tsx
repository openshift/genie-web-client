import React, { useEffect, useState } from 'react';
import { useSetActiveConversation } from '../../hooks/AIState';
import { Chatbot, ChatbotContent, ChatbotDisplayMode } from '@patternfly/chatbot';
import { useParams } from 'react-router-dom-v5-compat';
import './Chat.css';
import { MessageList } from './MessageList';
import { RenderCounter } from '../layout/RenderTest';

export const Chat: React.FunctionComponent = () => {
  const { conversationId } = useParams();
  const setActiveConversation = useSetActiveConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);
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

  return (
    <>
      <Chatbot displayMode={ChatbotDisplayMode.embedded}>
      <ChatbotContent>
        <MessageList
          key={conversationId}
          isLoading={isLoading}
          isValidConversationId={isValidConversationId}
        />
      </ChatbotContent>
    </Chatbot>
    <RenderCounter label="Chat Component" />
    </>
  );
};
