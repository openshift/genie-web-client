import { MutableRefObject, RefObject, useEffect } from 'react';

/**
 * Custom hook to manage focus when new items are loaded via the "Load more" button.
 * Automatically moves focus to the first newly loaded article when infinite scroll is disabled.
 * 
 * This provides better accessibility by ensuring users know where new content has been added.
 * Focus is placed directly on the article element itself, not on any focusable elements within it.
 * Only moves focus if:
 * - Infinite scroll is disabled
 * - Loading has completed
 * - New items were actually added
 * - The button had focus when clicked (tracked before loading started)
 * 
 * @param isInfiniteScrollEnabled - Whether infinite scroll is enabled
 * @param isLoading - Whether items are currently being loaded
 * @param itemsLength - Current number of items
 * @param feedRef - Ref to the feed container
 * @param loadMoreButtonRef - Ref to the "Load more" button
 * @param previousPostCountRef - Ref tracking the item count before loading
 * @param loadMoreButtonHadFocusRef - Ref tracking if button had focus when clicked
 */
export function useFocusManagement({
  isInfiniteScrollEnabled,
  isLoading,
  itemsLength,
  feedRef,
  loadMoreButtonRef,
  previousPostCountRef,
  loadMoreButtonHadFocusRef
}: {
  isInfiniteScrollEnabled: boolean;
  isLoading: boolean;
  itemsLength: number;
  feedRef: RefObject<HTMLDivElement>;
  loadMoreButtonRef: RefObject<HTMLButtonElement>;
  previousPostCountRef: MutableRefObject<number>;
  loadMoreButtonHadFocusRef: MutableRefObject<boolean>;
}) {
  useEffect(() => {
    if (
      !isInfiniteScrollEnabled &&
      !isLoading &&
      itemsLength > previousPostCountRef.current &&
      loadMoreButtonHadFocusRef.current
    ) {
      const firstNewItemIndex = previousPostCountRef.current;
      
      // Use setTimeout to ensure DOM is fully updated before attempting to focus
      setTimeout(() => {
        // Focus the first new article (button is hidden during loading, so we always move focus)
        if (feedRef.current) {
          const articleElements = Array.from(
            feedRef.current.querySelectorAll<HTMLElement>('article[tabindex="0"]')
          ) as HTMLElement[];

          const firstNewArticle = articleElements[firstNewItemIndex];

          if (firstNewArticle) {
            // Focus the article itself (not any focusable elements within it)
            firstNewArticle.focus();
          }
        }
        // Reset the flag after attempting to move focus
        loadMoreButtonHadFocusRef.current = false;
      }, 100);
    }
  }, [isLoading, isInfiniteScrollEnabled, itemsLength, feedRef, previousPostCountRef, loadMoreButtonHadFocusRef]);
}

