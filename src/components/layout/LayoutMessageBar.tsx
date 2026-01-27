import React from 'react';
import { useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { MessageBar } from '@patternfly/chatbot';
import { useSendStreamMessage } from '../../hooks/AIState';
import { mainGenieRoute, SubRoutes } from '../routeList';

interface LayoutMessageBarProps {
  messageBarRef: React.RefObject<HTMLTextAreaElement>;
}

export const LayoutMessageBar: FC<LayoutMessageBarProps> = ({ messageBarRef }) => {
  const navigate = useNavigate();
  const sendStreamMessage = useSendStreamMessage();

  const handleSendMessage = useCallback(
    (value: string | number) => {
      sendStreamMessage(value);
      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
    },
    [sendStreamMessage, navigate],
  );

  return <MessageBar ref={messageBarRef} onSendMessage={handleSendMessage} />;
};
