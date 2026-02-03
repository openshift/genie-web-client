import React, { useCallback, useEffect, useState } from 'react';
import {
  Chatbot,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  MessageBar,
} from '@patternfly/chatbot';
import { Button } from '@patternfly/react-core';
import './Chat.css';
import { MessageList } from './MessageList';
import { BadResponseModal, BadResponseModalProvider } from './feedback/BadResponseModal';
import { useChatConversation } from '../../hooks/useChatConversation';
import type { CanvasState } from '../../hooks/useChatConversation';
import { CanvasLayout } from '../canvas';
import {
  useSetActiveConversation,
  useActiveConversation,
  useSendStreamMessage,
} from '../../hooks/AIState';
import { useParams, useNavigate } from 'react-router-dom-v5-compat';

export const Chat: React.FunctionComponent = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const setActiveConversation = useSetActiveConversation();
  const activeConversation = useActiveConversation();
  const sendStreamMessage = useSendStreamMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);
  const { isCanvasOpen, canvasState, setCanvasState } = useChatConversation();

  // Test toggle for canvas states (development only)
  const handleToggleCanvasState = useCallback(() => {
    const stateOrder: CanvasState[] = ['closed', 'open', 'maximized'];
    const currentIndex = stateOrder.indexOf(canvasState);
    const nextIndex = (currentIndex + 1) % stateOrder.length;
    setCanvasState(stateOrder[nextIndex]);
  }, [canvasState, setCanvasState]);

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

  const handleSendMessage = useCallback(
    (value: string | number) => {
      sendStreamMessage(String(value));
    },
    [sendStreamMessage],
  );

  return (
    <>
      {/* Test button for canvas states - development only */}
      {process.env.NODE_ENV === 'development' ? (
        <Button
          variant="tertiary"
          size="sm"
          onClick={handleToggleCanvasState}
          style={{ margin: '8px', alignSelf: 'flex-start' }}
        >
          Toggle Canvas: {canvasState}
        </Button>
      ) : null}
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
              <MessageBar onSendMessage={handleSendMessage} />
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
    </>
  );
};
