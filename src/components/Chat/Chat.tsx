import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useActiveConversation,
  useSendStreamMessage,
  useSetActiveConversation,
} from '../../hooks/AIState';
import { useChatDrawerState } from '../../hooks/useChatDrawerState';
import {
  Chatbot,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  MessageBar,
} from '@patternfly/chatbot';
import {
  CompassPanel,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';
import { useChatBar } from '../ChatBarContext';
import { MessageList } from './MessageList';
import { BadResponseModal, BadResponseModalProvider } from './feedback/BadResponseModal';
import { mainGenieRoute, SubRoutes } from '../routeList';
import { useSplitScreenDrawer } from '../drawer/SplitScreenDrawerContext';
import './Chat.css';

const CHAT_DRAWER_MAX_WIDTH = '80%';
const CHAT_DRAWER_MIN_WIDTH = '33.33%';
const CHAT_DRAWER_DEFAULT_WIDTH = '60%';

export const Chat: React.FunctionComponent = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const setActiveConversation = useSetActiveConversation();
  const activeConversation = useActiveConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);
  const { setShowChatBar } = useChatBar();
  const sendStreamMessage = useSendStreamMessage();
  const messageBarRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { splitScreenDrawerState, closeSplitScreenDrawer } = useSplitScreenDrawer();
  const [drawerState, setDrawerState] = useChatDrawerState();

  const handleSendMessage = useCallback(
    (value: string | number) => {
      sendStreamMessage(String(value));
      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
    },
    [sendStreamMessage, navigate],
  );

  const onCloseClick = useCallback(() => {
    closeSplitScreenDrawer();
    setDrawerState((prevState) => ({ ...prevState, active: false }));
  }, [closeSplitScreenDrawer, setDrawerState]);

  const onExpand = useCallback(() => {
    drawerRef.current && drawerRef.current.focus();
    setDrawerState((prevState) => ({ ...prevState, active: true }));
  }, [setDrawerState]);

  const onResize = useCallback(
    (_event: MouseEvent | TouchEvent | React.KeyboardEvent<Element>, width: number) => {
      setDrawerState((prevState) => ({ ...prevState, active: true, width }));
    },
    [setDrawerState],
  );

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
  }, [conversationId, activeConversation?.id, setActiveConversation]);

  useEffect(() => {
    if (!conversationId && activeConversation?.id && !activeConversation?.id.includes('__temp')) {
      // Replace the current history entry to sync URL with active conversation
      navigate(`/genie/chat/${activeConversation.id}`, { replace: true });
    }
  }, [conversationId, activeConversation, navigate]);

  useEffect(() => {
    setShowChatBar(isValidConversationId);
  }, [isValidConversationId, setShowChatBar]);

  const panelContent = (
    <DrawerPanelContent
      isResizable
      onResize={onResize}
      defaultSize={drawerState.width ? `${drawerState.width}px` : CHAT_DRAWER_DEFAULT_WIDTH}
      maxSize={CHAT_DRAWER_MAX_WIDTH}
      minSize={CHAT_DRAWER_MIN_WIDTH}
    >
      <DrawerHead>
        <span tabIndex={splitScreenDrawerState.isOpen ? 0 : -1} ref={drawerRef}>
          Drawer panel header
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>{splitScreenDrawerState.children}</DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <BadResponseModalProvider>
      <Drawer
        isInline
        isExpanded={splitScreenDrawerState.isOpen || drawerState.active}
        isPill
        position="right"
        onExpand={onExpand}
      >
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>
            <CompassPanel isFullHeight>
              <Chatbot displayMode={ChatbotDisplayMode.embedded}>
                <ChatbotContent isPrimary>
                  <MessageList
                    key={conversationId}
                    isLoading={isLoading}
                    isValidConversationId={isValidConversationId}
                  />
                </ChatbotContent>
                <ChatbotFooter isPrimary>
                  <MessageBar isPrimary ref={messageBarRef} onSendMessage={handleSendMessage} />
                </ChatbotFooter>
                <BadResponseModal />
              </Chatbot>
            </CompassPanel>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </BadResponseModalProvider>
  );
};
