export type SuggestionKey = 'build' | 'automate' | 'troubleshoot' | 'analyze' | 'explore';

export interface QuickResponseItem {
  id: string;
  labelKey: string;
}

export interface QuickResponsesPayload {
  key: string;
  items: QuickResponseItem[];
}

export const quickResponseKeyMap: Record<SuggestionKey, string[]> = {
  build: [
    'newChat.quickResponses.build.0.label',
    'newChat.quickResponses.build.1.label',
    'newChat.quickResponses.build.2.label',
    'newChat.quickResponses.build.3.label',
  ],
  automate: [
    'newChat.quickResponses.automate.0.label',
    'newChat.quickResponses.automate.1.label',
    'newChat.quickResponses.automate.2.label',
    'newChat.quickResponses.automate.3.label',
  ],
  troubleshoot: [
    'newChat.quickResponses.troubleshoot.0.label',
    'newChat.quickResponses.troubleshoot.1.label',
    'newChat.quickResponses.troubleshoot.2.label',
    'newChat.quickResponses.troubleshoot.3.label',
  ],
  analyze: [
    'newChat.quickResponses.analyze.0.label',
    'newChat.quickResponses.analyze.1.label',
    'newChat.quickResponses.analyze.2.label',
    'newChat.quickResponses.analyze.3.label',
  ],
  explore: [
    'newChat.quickResponses.explore.0.label',
    'newChat.quickResponses.explore.1.label',
    'newChat.quickResponses.explore.2.label',
    'newChat.quickResponses.explore.3.label',
  ],
};

export function getIntroPromptKey(key: SuggestionKey): string {
  return `newChat.intro.${key}`;
}

// build PatternFly Message quickResponses
export function toMessageQuickResponses(
  items: Array<{ id: string; labelKey: string }> | undefined,
  t: (key: string) => string,
  onSelect: (text: string) => void,
): Array<{ id: string; content: string; onClick: () => void }> | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }
  return items.map(({ id, labelKey }) => {
    const text = t(labelKey);
    return {
      id,
      content: text,
      onClick: () => onSelect(text),
    };
  });
}

export const buildQuickResponsesPayload = (key: SuggestionKey) => ({
  key,
  items: quickResponseKeyMap[key].map((labelKey, idx) => ({
    id: `${key}-${idx}`,
    labelKey,
  })),
});
