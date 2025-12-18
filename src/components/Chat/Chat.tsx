import React, { useEffect, useState } from 'react';
import {
  useMessages,
  useSendMessage,
  useSetActiveConversation,
} from '@redhat-cloud-services/ai-react-state';
import {
  Chatbot,
  ChatbotHeader,
  ChatbotHeaderTitle,
  ChatbotHeaderActions,
  ChatbotHeaderOptionsDropdown,
  ChatbotContent,
  MessageBox,
  Message,
  ChatbotDisplayMode,
  ChatbotHeaderMain,
} from '@patternfly/chatbot';
import { Button, Divider, DropdownItem, DropdownList } from '@patternfly/react-core';
import { RhStandardThoughtBubbleIcon, RhUiShareAltIcon } from '@patternfly/react-icons';
import { useParams } from 'react-router-dom-v5-compat';
import { ChatLoading } from './ChatLoading';
import { ConversationNotFound } from './ConversationNotFound';
import { useChatBar } from '../ChatBarContext';
import './Chat.css';
import { useTranslation } from 'react-i18next';
import { toMessageQuickResponses } from '../new-chat/suggestions';

export const Chat: React.FC = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = useMessages();
  const { conversationId } = useParams();
  const setActiveConversation = useSetActiveConversation();
  const sendMessage = useSendMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);
  const { setShowChatBar } = useChatBar();
  const { t } = useTranslation('plugin__genie-web-client');
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
  const formatMessages = (): ReactElement[] => {
    return messages.map((msg) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Type assertion needed for Red Hat Cloud Services message format compatibility
      // TODO: see if ai-react-state has an exported type for the message object
      const message = msg as unknown as {
        role?: string;
        answer?: string;
        query?: string;
        message?: string;
        content?: string;
        timestamp?: number | string;
        createdAt?: number | string;
      };
      const isBot = message.role === 'bot';
      let content = message.answer || message.query || message.message || message.content || '';
      content = content.split('=====The following is the user query that was asked:').pop();

      // Map quick responses payload into Message quickResponses
      const quickResponses = toMessageQuickResponses(
        message.additionalAttributes?.quickResponses?.items,
        t,
        (text) => sendMessage(text, { stream: true }),
      );

      const messageIsLoading = !content && !(quickResponses && quickResponses.length > 0);

      return (
        <Message
          key={msg.id}
          isLoading={messageIsLoading}
          name={isBot ? 'Genie' : 'You'}
          isPrimary={!isBot}
          role={isBot ? 'bot' : 'user'}
          timestamp={new Date(
            message.timestamp || message.createdAt || Date.now(),
          ).toLocaleTimeString()}
          content={content}
          quickResponses={quickResponses}
        />
      );
    });
  };

  return (
    <Chatbot displayMode={ChatbotDisplayMode.embedded}>
      <ChatbotHeader>
        <ChatbotHeaderMain>
          <RhStandardThoughtBubbleIcon />
          <ChatbotHeaderTitle>title</ChatbotHeaderTitle>
        </ChatbotHeaderMain>
        <ChatbotHeaderActions>
          <Button variant="primary" icon={<RhUiShareAltIcon />} aria-label={t('chat.share')}>
            {t('chat.share')}
          </Button>
          <ChatbotHeaderOptionsDropdown isCompact tooltipProps={{ content: 'More actions' }}>
            <DropdownList>
              <DropdownItem value="rename">{t('chat.rename')}</DropdownItem>
            </DropdownList>
          </ChatbotHeaderOptionsDropdown>
        </ChatbotHeaderActions>
      </ChatbotHeader>
      <Divider />
      <ChatbotContent>
        <MessageBox>
          {isLoading && messages.length === 0 ? <ChatLoading /> : null}
          {!isValidConversationId ? <ConversationNotFound /> : null}
          {formatMessages()}
          <div ref={bottomRef}></div>
        </MessageBox>
      </ChatbotContent>
    </Chatbot>
  );
};
