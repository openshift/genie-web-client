import React, { useEffect, useState } from 'react';
import { useActiveConversation, useSetActiveConversation } from '../../hooks/AIState';
import { Chatbot, ChatbotContent, ChatbotDisplayMode, ChatbotFooter } from '@patternfly/chatbot';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';
import './Chat.css';
import { MessageList } from './MessageList';
import { BadResponseModal, BadResponseModalProvider } from './feedback/BadResponseModal';
import { ChatMessageBar } from './ChatMessageBar';
import { CompassPanel } from '@patternfly/react-core';

export const Chat: React.FunctionComponent = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const setActiveConversation = useSetActiveConversation();
  const activeConversation = useActiveConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);

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

  return (
    <BadResponseModalProvider>
      <CompassPanel isFullHeight className="chat">
        <Chatbot displayMode={ChatbotDisplayMode.embedded} className="chat-bot">
          <ChatbotContent>
            <MessageList
              key={conversationId}
              isLoading={isLoading}
              isValidConversationId={isValidConversationId}
            />
          </ChatbotContent>
          <ChatbotFooter>
            <ChatMessageBar />
          </ChatbotFooter>
          <BadResponseModal />
        </Chatbot>
      </CompassPanel>
    </BadResponseModalProvider>
  );
};
