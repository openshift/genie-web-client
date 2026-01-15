const defaultText = {
  feedSettings: 'Feed settings',
  allLoaded: 'All loaded',
  couldNotLoadMore: 'Could not load more',
  retry: 'Retry',
  loadingMore: 'Loading more.',
  newContentWillReceiveFocusOnceLoaded: 'New content will receive focus once loaded',
  loadMore: 'Load more',
  enableAutomaticLoadingOfNew: 'Enable automatic loading of new',
  keyboardShortcuts: 'Keyboard shortcuts',
  escapeKey: 'Escape',
  exitList: 'Exit list',
  pageDownKey: 'Page Down',
  moveFocusToNextItem: 'Move focus to next item',
  pageUpKey: 'Page Up',
  moveFocusToPreviousItem: 'Move focus to previous item',
  controlHomeKey: 'Control + Home',
  moveFocusToFirstFocusableElementInTheFeed: 'Move focus to first focusable element in the feed',
  controlEndKey: 'Control + End',
  moveFocusToFirstFocusableElementAfterTheFeed:
    'Move focus to first focusable element after the feed',
} as const;

export type textType = Partial<{
  [K in keyof typeof defaultText]: string;
}>;

export const setText = (customText: textType): textType => {
  return {
    ...defaultText,
    ...customText,
  };
};
