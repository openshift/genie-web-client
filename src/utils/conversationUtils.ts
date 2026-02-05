export const TEMP_CONVERSATION_ID = '__temp_conversation__';
export const TEMP_LIGHTSPEED_CONVERSATION_ID = '__temp_lightspeed_conversation__';

/**
 * Check if a conversation ID is a temporary conversation
 * Checks for exact matches or if the ID contains '__temp'
 */
export const isTempConversationId = (id: string | undefined): boolean => {
  if (!id) {
    return false;
  }
  return (
    id === TEMP_CONVERSATION_ID || id === TEMP_LIGHTSPEED_CONVERSATION_ID || id.includes('__temp')
  );
};
