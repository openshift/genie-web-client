import { useCallback, useContext } from 'react';
import { AIStateContext } from '@redhat-cloud-services/ai-react-state';
import { useSendStreamMessage } from './messageHooks';

/**
 * Handles editing of the last user message without backend support for message deletion.
 * Frontend visually hides the original message and AI response, then sends the edited
 * content as a new turn. Backend retains full history.
 */
export function useEditMessage(): (editedContent: string) => void {
  const { getState } = useContext(AIStateContext);
  const sendStreamMessage = useSendStreamMessage();

  return useCallback(
    (editedContent: string) => {
      const stateManager = getState();
      const state = stateManager.getState();
      const conversationId = state.activeConversationId;

      if (!conversationId) {
        console.error('No active conversation found');
        return;
      }

      const conversation = state.conversations[conversationId];
      if (!conversation) {
        console.error('Active conversation not found in state');
        return;
      }

      const messages = conversation.messages;
      let lastUserMessageIndex = -1;

      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserMessageIndex = i;
          break;
        }
      }

      if (lastUserMessageIndex === -1) {
        console.error('No user message found to edit');
        return;
      }

      // frontend-only workaround since backend doesn't support message deletion
      for (let i = lastUserMessageIndex; i < messages.length; i++) {
        const message = messages[i];
        if (!message.additionalAttributes) {
          message.additionalAttributes = {};
        }
        // type assertion needed: adding hidden flag outside typed interface for frontend-only filtering
        (message.additionalAttributes as Record<string, unknown>).hidden = true;
      }

      stateManager.notifyAll();
      sendStreamMessage(editedContent);
    },
    [getState, sendStreamMessage],
  );
}
