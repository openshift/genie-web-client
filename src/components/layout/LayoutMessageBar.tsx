import React from 'react';
import { useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { MessageBar } from '@patternfly/chatbot';
import {
  useCreateNewConversation,
  useSendStreamMessage,
  useActiveConversation,
} from '../../hooks/AIState';
import { mainGenieRoute, SubRoutes } from '../routeList';

interface LayoutMessageBarProps {
  messageBarRef: React.RefObject<HTMLTextAreaElement>;
}

export const LayoutMessageBar: FC<LayoutMessageBarProps> = ({ messageBarRef }) => {
  const navigate = useNavigate();
  const sendStreamMessage = useSendStreamMessage();
  const createNewConversation = useCreateNewConversation();
  const activeConversation = useActiveConversation();

  const handleSendMessage = useCallback(
    async (value: string | number) => {
      // Only create a new conversation if there isn't an active one
      if (!activeConversation) {
        await createNewConversation();
      }
      sendStreamMessage(value);
      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
    },
    [sendStreamMessage, navigate, createNewConversation, activeConversation],
  );

  return <MessageBar ref={messageBarRef} onSendMessage={handleSendMessage} />;
};
