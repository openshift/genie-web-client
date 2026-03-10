import {
  mainGenieRoute,
  SubRoutes,
  START_CHAT_PROMPT_PARAM,
  getStartChatWithPromptUrl,
} from './routeList';

describe('routeList', () => {
  describe('getStartChatWithPromptUrl', () => {
    it('returns URL with path /genie/chat/start and prompt query param', () => {
      const url = getStartChatWithPromptUrl('Can you help me create a new dashboard?');
      expect(url).toContain(`${mainGenieRoute}/${SubRoutes.Chat}/${SubRoutes.StartChat}`);
      expect(url).toContain(`${START_CHAT_PROMPT_PARAM}=`);
    });

    it('encodes the prompt in the query string', () => {
      const prompt = 'Hello? world=1&foo';
      const url = getStartChatWithPromptUrl(prompt);
      const match = url.match(/\?prompt=(.+)$/);
      expect(match).not.toBeNull();
      expect(decodeURIComponent(match![1])).toBe(prompt);
    });

    it('returns same path for empty string prompt', () => {
      const url = getStartChatWithPromptUrl('');
      expect(url).toBe(
        `${mainGenieRoute}/${SubRoutes.Chat}/${SubRoutes.StartChat}?${START_CHAT_PROMPT_PARAM}=`,
      );
    });
  });
});
