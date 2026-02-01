import { useCallback, type FC } from 'react';
import { MessageBar } from '@patternfly/chatbot';
import { useSendStreamMessage } from '../../hooks/AIState';

interface ChatMessageBarProps {
  onSendMessage?: (message: string | number) => void;
}

export const ChatMessageBar: FC<ChatMessageBarProps> = ({ onSendMessage }) => {
  const sendStreamMessage = useSendStreamMessage();

  const handleSendMessage = useCallback(
    (value: string | number) => {
      sendStreamMessage(value);
      onSendMessage?.(value);
    },
    [sendStreamMessage, onSendMessage],
  );

  return <MessageBar onSendMessage={handleSendMessage} />;
};
