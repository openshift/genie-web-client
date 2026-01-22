import React, { useEffect, useState } from 'react';
import { useActiveConversation, useSetActiveConversation } from '../../hooks/AIState';
import { Chatbot, ChatbotContent, ChatbotDisplayMode } from '@patternfly/chatbot';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';
import { useChatBar } from '../ChatBarContext';
import './Chat.css';
import { MessageList } from './MessageList';
import { BadResponseModal, BadResponseModalProvider } from './feedback/BadResponseModal';

export const Chat: React.FunctionComponent = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const setActiveConversation = useSetActiveConversation();
  const activeConversation = useActiveConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);
  const { setShowChatBar } = useChatBar();
  useEffect(() => {
    if (conversationId && activeConversation?.id !== conversationId) {
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
    if (!conversationId && activeConversation?.id && !activeConversation?.id.includes('__temp')) {
      // Replace the current history entry to sync URL with active conversation
      navigate(`/genie/chat/${activeConversation.id}`, { replace: true });
    }
  }, [conversationId, activeConversation, navigate]);

  useEffect(() => {
    setShowChatBar(isValidConversationId);
  }, [isValidConversationId, setShowChatBar]);

  return (
    <BadResponseModalProvider>
      <Chatbot displayMode={ChatbotDisplayMode.embedded}>
        <ChatbotContent>
          <MessageList
            key={conversationId}
            isLoading={isLoading}
            isValidConversationId={isValidConversationId}
          />
        </ChatbotContent>
        <BadResponseModal />
      </Chatbot>
    </BadResponseModalProvider>
  );
};
