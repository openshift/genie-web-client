import React, { useCallback, useEffect, useState } from 'react';
import {
  Chatbot,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  MessageBar,
} from '@patternfly/chatbot';
import './Chat.css';
import { MessageList } from './MessageList';
import { BadResponseModal, BadResponseModalProvider } from './feedback/BadResponseModal';
import { CanvasLayout, CanvasContent } from '../canvas';
import { DashboardCanvasToolbar } from '../dashboard';
import {
  useSetActiveConversation,
  useActiveConversation,
  useSendStreamMessage,
  useInProgress,
} from '../../hooks/AIState';
import { useParams, useNavigate } from 'react-router-dom-v5-compat';
import { isTempConversationId } from '../../utils/conversationUtils';
import {
  ChatConversationProvider,
  useChatConversationContext,
} from '../../hooks/useChatConversation';

/**
 * Inner Chat component that uses the context.
 */
const ChatInner: React.FunctionComponent = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const setActiveConversation = useSetActiveConversation();
  const activeConversation = useActiveConversation();
  const sendStreamMessage = useSendStreamMessage();
  const isInProgress = useInProgress();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);
  const { isCanvasOpen, canvasState } = useChatConversationContext();

  useEffect(() => {
    // Don't try to load the temp conversation ID as a real conversation
    if (isTempConversationId(conversationId)) {
      return;
    }

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
    // If URL has temp conversation ID and we have a real conversation ID, replace it
    if (
      isTempConversationId(conversationId) &&
      activeConversation?.id &&
      !isTempConversationId(activeConversation.id)
    ) {
      navigate(`/genie/chat/${activeConversation.id}`, { replace: true });
      return;
    }

    // If no conversationId in URL but we have a real active conversation, sync the URL
    if (!conversationId && activeConversation?.id && !isTempConversationId(activeConversation.id)) {
      navigate(`/genie/chat/${activeConversation.id}`, { replace: true });
    }
  }, [conversationId, activeConversation, navigate]);

  const handleSendMessage = useCallback(
    (value: string | number) => {
      if (isInProgress) return;
      sendStreamMessage(String(value));
    },
    [sendStreamMessage, isInProgress],
  );

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
            <MessageBar onSendMessage={handleSendMessage} isSendButtonDisabled={isInProgress} />
          </ChatbotFooter>
          <BadResponseModal />
        </Chatbot>
        <div className="chat__canvas pf-v6-c-compass__panel pf-m-full-height">
          <CanvasLayout toolbar={<DashboardCanvasToolbar />}>
            <CanvasContent />
          </CanvasLayout>
        </div>
      </BadResponseModalProvider>
    </div>
  );
};

/**
 * Chat component wrapped with ChatConversationProvider.
 * Provides canvas and artifact state to all nested components.
 */
export const Chat: React.FunctionComponent = () => {
  return (
    <ChatConversationProvider>
      <ChatInner />
    </ChatConversationProvider>
  );
};
