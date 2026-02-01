import React from 'react';
import { Chatbot, ChatbotContent, ChatbotDisplayMode, ChatbotFooter } from '@patternfly/chatbot';
import './Chat.css';
import { MessageList } from './MessageList';
import { BadResponseModal, BadResponseModalProvider } from './feedback/BadResponseModal';
import { ChatMessageBar } from './ChatMessageBar';
import { CompassPanel } from '@patternfly/react-core';
import { useChatConversation } from '../../hooks/useChatConversation';

export const Chat: React.FunctionComponent = () => {
  const { conversationId, isLoading, isValidConversationId, isCanvasOpen } = useChatConversation();

  return (
    <BadResponseModalProvider>
      <CompassPanel isFullHeight className={`chat${isCanvasOpen ? ' chat--canvas-open' : ''}`}>
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
