import {
  useActiveConversation as aiStateUseActiveConversation,
  useSetActiveConversation as aiStateUseSetActiveConversation,
  useConversations as aiStateUseConversations,
  useCreateNewConversation as aiStateUseCreateNewConversation,
} from '@redhat-cloud-services/ai-react-state';

export const useSetActiveConversation = () => {
  const setActiveConversation = aiStateUseSetActiveConversation();
  return setActiveConversation;
};

export const useActiveConversation = () => {
  const activeConversation = aiStateUseActiveConversation();
  return activeConversation;
};

export const useConversations = () => {
  const conversations = aiStateUseConversations();
  return conversations;
};

export const useCreateNewConversation = () => {
  const createNewConversation = aiStateUseCreateNewConversation();
  return createNewConversation;
};
