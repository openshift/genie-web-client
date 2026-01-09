import React, { useEffect, useState } from 'react';
import { useSetActiveConversation } from '../../hooks/AIState';
import {
  Chatbot,
  ChatbotHeader,
  ChatbotHeaderTitle,
  ChatbotHeaderActions,
  ChatbotHeaderOptionsDropdown,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotHeaderMain,
} from '@patternfly/chatbot';
import {
  Button,
  Divider,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core';
import {
  RhStandardThoughtBubbleIcon,
  RhUiShareAltIcon,
} from '@patternfly/react-icons';
import { useParams } from 'react-router-dom-v5-compat';
import { useChatBar } from '../ChatBarContext';
import './Chat.css';
import { useTranslation } from 'react-i18next';
import { MessageList } from './MessageList';

export const Chat: React.FunctionComponent = () => {
  const { conversationId } = useParams();
  const setActiveConversation = useSetActiveConversation();
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

  return (
    <Chatbot displayMode={ChatbotDisplayMode.embedded}>
      <ChatbotHeader>
        <ChatbotHeaderMain>
          <RhStandardThoughtBubbleIcon />
          <ChatbotHeaderTitle>title</ChatbotHeaderTitle>
        </ChatbotHeaderMain>
        <ChatbotHeaderActions>
          <Button
            variant="primary"
            icon={<RhUiShareAltIcon />}
            aria-label={t('chat.share')}
          >
            {t('chat.share')}
          </Button>
          <ChatbotHeaderOptionsDropdown
            isCompact
            tooltipProps={{ content: 'More actions' }}
          >
            <DropdownList>
              <DropdownItem value="rename">{t('chat.rename')}</DropdownItem>
            </DropdownList>
          </ChatbotHeaderOptionsDropdown>
        </ChatbotHeaderActions>
      </ChatbotHeader>
      <Divider />
      <ChatbotContent>
        <MessageList
          isLoading={isLoading}
          isValidConversationId={isValidConversationId}
        />
      </ChatbotContent>
    </Chatbot>
  );
};
