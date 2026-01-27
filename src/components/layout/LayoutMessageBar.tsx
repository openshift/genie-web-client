import React from 'react';
import { useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { MessageBar } from '@patternfly/chatbot';
import { useCreateNewConversation, useSendStreamMessage } from '../../hooks/AIState';
import { mainGenieRoute, SubRoutes } from '../routeList';

interface LayoutMessageBarProps {
  messageBarRef: React.RefObject<HTMLTextAreaElement>;
}

export const LayoutMessageBar: FC<LayoutMessageBarProps> = ({ messageBarRef }) => {
  const navigate = useNavigate();
  const sendStreamMessage = useSendStreamMessage();
  const createNewConversation = useCreateNewConversation();

  const handleSendMessage = useCallback(
    async (value: string | number) => {
      await createNewConversation();
      sendStreamMessage(value);
      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
    },
    [sendStreamMessage, navigate, createNewConversation],
  );

  return <MessageBar ref={messageBarRef} onSendMessage={handleSendMessage} />;
};
