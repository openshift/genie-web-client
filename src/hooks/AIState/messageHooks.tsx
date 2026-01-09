import {
  useSendMessage as aiStateUseSendMessage,
  useMessages as aiStateUseMessages,
  useSendStreamMessage as aiStateUseSendStreamMessage,
} from '@redhat-cloud-services/ai-react-state';

export const useSendMessage = () => {
  const sendMessage = aiStateUseSendMessage();
  return sendMessage;
};

export const useMessages = () => {
  const messages = aiStateUseMessages();
  return messages;
};

export const useSendStreamMessage = () => {
  const sendStreamMessage = aiStateUseSendStreamMessage();
  return sendStreamMessage;
};
