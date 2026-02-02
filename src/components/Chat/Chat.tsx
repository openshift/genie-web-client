import React from 'react';
import { Chatbot, ChatbotContent, ChatbotDisplayMode, ChatbotFooter } from '@patternfly/chatbot';
import './Chat.css';
import { MessageList } from './MessageList';
import { BadResponseModal, BadResponseModalProvider } from './feedback/BadResponseModal';
import { ChatMessageBar } from './ChatMessageBar';
import { useChatConversation } from '../../hooks/useChatConversation';
import { CanvasLayout } from '../canvas';

export const Chat: React.FunctionComponent = () => {
  const {
    conversationId,
    isLoading,
    isValidConversationId,
    isCanvasOpen,
    canvasState,
    // callbacks for canvas state
    // openCanvas,
    // closeCanvas,
    // maximizeCanvas,
  } = useChatConversation();

  return (
    <div className={`chat${isCanvasOpen ? ` chat--canvas-${canvasState}` : ''}`}>
      <BadResponseModalProvider>
        <Chatbot
          displayMode={ChatbotDisplayMode.embedded}
          className="chat__chatbot pf-v6-c-compass__panel pf-m-full-height"
        >
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
        {/* TODO: We may want to create Canvas component wrapper in the future */}
        <div className="chat__canvas pf-v6-c-compass__panel pf-m-full-height">
          <CanvasLayout>
            <div className="chat__canvas-content">
              <h1>Canvas Content</h1>
            </div>
          </CanvasLayout>
        </div>
      </BadResponseModalProvider>
    </div>
  );
};
