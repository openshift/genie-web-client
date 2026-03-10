export const mainGenieRoute = '/genie'; // NOTE make sure this matches what is in the console-extensions.json file

export enum SubRoutes {
  AIandAutomation = 'ai-and-automation',
  Infrastructure = 'infrastructure',
  Insights = 'insights',
  Security = 'security',
  // Chat and sub routes
  Chat = 'chat',
  New = 'new',
  StartChat = 'start',
  // Library
  Library = 'library',
  // Canvas
  Canvas = 'canvas',
}

// Used only for navigation - make sure this nesting represents Routes.tsx
export const ChatNew = `${SubRoutes.Chat}/${SubRoutes.New}`;

/** Query param for the "start chat with prompt" route; value is the message to stream. */
export const START_CHAT_PROMPT_PARAM = 'prompt';

/**
 * Builds the URL for "start a new chat and stream this prompt, then go to chat".
 * Use with navigate() from any button; the route runs create + send + redirect.
 */
export function getStartChatWithPromptUrl(prompt: string): string {
  const segment = `${mainGenieRoute}/${SubRoutes.Chat}/${SubRoutes.StartChat}`;
  const encoded = encodeURIComponent(prompt);
  return `${segment}?${START_CHAT_PROMPT_PARAM}=${encoded}`;
}
