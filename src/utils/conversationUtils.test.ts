import {
  isTempConversationId,
  TEMP_CONVERSATION_ID,
  TEMP_LIGHTSPEED_CONVERSATION_ID,
} from './conversationUtils';

describe('conversationUtils', () => {
  describe('isTempConversationId', () => {
    it('returns false for undefined', () => {
      expect(isTempConversationId(undefined)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isTempConversationId('')).toBe(false);
    });

    it('returns true for TEMP_CONVERSATION_ID', () => {
      expect(isTempConversationId(TEMP_CONVERSATION_ID)).toBe(true);
    });

    it('returns true for TEMP_LIGHTSPEED_CONVERSATION_ID', () => {
      expect(isTempConversationId(TEMP_LIGHTSPEED_CONVERSATION_ID)).toBe(true);
    });

    it('returns true for IDs containing __temp', () => {
      expect(isTempConversationId('conversation__temp123')).toBe(true);
      expect(isTempConversationId('abc__temp')).toBe(true);
      expect(isTempConversationId('__tempxyz')).toBe(true);
      expect(isTempConversationId('prefix__temp_suffix')).toBe(true);
    });

    it('returns false for permanent conversation IDs', () => {
      expect(isTempConversationId('permanent-conversation-123')).toBe(false);
      expect(isTempConversationId('some-other-id')).toBe(false);
      expect(isTempConversationId('temporary')).toBe(false);
      expect(isTempConversationId('temp')).toBe(false);
    });
  });
});
