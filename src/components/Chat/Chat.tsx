import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useActiveConversation,
  useSendStreamMessage,
  useSetActiveConversation,
} from '../../hooks/AIState';
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

const CHAT_SPLIT_SCREEN = 'genie-split-screen';

interface DrawerState {
  active: boolean;
  width?: number;
}

const getDrawerStateFromStorage = (): DrawerState => {
  try {
    const drawerLocalState = localStorage.getItem(CHAT_SPLIT_SCREEN);
    if (drawerLocalState) {
      return JSON.parse(drawerLocalState);
    }
  } catch (error) {
    console.error('Error reading drawer state from localStorage:', error);
  }
  return { active: false };
};

const saveDrawerStateToStorage = (state: DrawerState): void => {
  try {
    localStorage.setItem(CHAT_SPLIT_SCREEN, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving drawer state to localStorage:', error);
  }
};

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
  const [drawerState, setDrawerState] = useState<DrawerState>(getDrawerStateFromStorage);

  const handleSendMessage = useCallback(
    (value: string | number) => {
      sendStreamMessage(String(value));
      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
    },
    [sendStreamMessage, navigate],
  );

  const onCloseClick = useCallback(() => {
    closeSplitScreenDrawer();
    setDrawerState((prevState) => {
      const newState = { ...prevState, active: false };
      saveDrawerStateToStorage(newState);
      return newState;
    });
  }, [closeSplitScreenDrawer]);

  const onExpand = useCallback(() => {
    drawerRef.current && drawerRef.current.focus();
    setDrawerState((prevState) => {
      const newState = { ...prevState, active: true };
      saveDrawerStateToStorage(newState);
      return newState;
    });
  }, []);

  const onResize = useCallback(
    (_event: MouseEvent | TouchEvent | React.KeyboardEvent<Element>, width: number) => {
      setDrawerState((prevState) => {
        const newState = { ...prevState, active: true, width };
        saveDrawerStateToStorage(newState);
        return newState;
      });
    },
    [],
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

  const panelContent = (
    <DrawerPanelContent
      isResizable
      onResize={onResize}
      defaultSize={drawerState.width ? `${drawerState.width}px` : '60%'}
      maxSize="80%"
      minSize="20%"
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
