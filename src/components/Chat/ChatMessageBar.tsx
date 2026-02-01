import { useCallback, type FC } from 'react';
import { MessageBar } from '@patternfly/chatbot';
import { useSendStreamMessage } from '../../hooks/AIState';

export const ChatMessageBar: FC = () => {
  const sendStreamMessage = useSendStreamMessage();

  const handleSendMessage = useCallback(
    (value: string | number) => {
      sendStreamMessage(value);
    },
    [sendStreamMessage],
  );

  return <MessageBar onSendMessage={handleSendMessage} />;
};
