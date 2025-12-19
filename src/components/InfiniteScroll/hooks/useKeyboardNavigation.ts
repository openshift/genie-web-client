import { RefObject, useEffect } from 'react';
import { findCurrentArticleIndex, getAllFocusableElements, isElementVisible } from '../utils/domUtils';

/**
 * Custom hook to handle keyboard navigation within the infinite scroll feed.
 * 
 * Supported shortcuts:
 * - Escape: Move focus out of the feed to the next focusable element
 * - Page Down: Move focus to the next article
 * - Page Up: Move focus to the previous article
 * - Ctrl/Cmd + Home: Move focus to the first article in the feed
 * - Ctrl/Cmd + End: Move focus to the first focusable element after the feed
 * 
 * @param postsContainerRef - Ref to the main container div
 * @param feedRef - Ref to the feed container (role="feed")
 * @param isInDrawer - If true, indicates that the infinite scroll is in a drawer.
 */
export function useKeyboardNavigation(
  postsContainerRef: RefObject<HTMLDivElement>,
  feedRef: RefObject<HTMLDivElement>,
  isInDrawer: boolean
) {
  useEffect(() => {
    const postsContainer = postsContainerRef.current;
    const feed = feedRef.current;
    if (!postsContainer || !feed) return;

    /**
     * Main keyboard event handler for feed navigation
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when focus is within the feed
      const activeElement = document.activeElement;
      if (!activeElement || !feed.contains(activeElement)) return;

      const allFocusableElements = getAllFocusableElements();

      // Escape: Move focus out of the feed to the next focusable element outside the container
      if (e.key === 'Escape' && !isInDrawer) {
        // Find the index of the currently focused element
        const currentIndex = allFocusableElements.indexOf(activeElement as HTMLElement);

        // Find the next focusable element that's NOT in the posts container
        for (let i = currentIndex + 1; i < allFocusableElements.length; i++) {
          const nextEl = allFocusableElements[i];
          if (!postsContainer.contains(nextEl)) {
            e.preventDefault();
            nextEl.focus();
            return;
          }
        }

        // If no element found after, try finding by position (below the container)
        const postsContainerRect = postsContainer.getBoundingClientRect();
        const nextFocusable = allFocusableElements.find((el) => {
          if (postsContainer.contains(el)) return false;
          const elRect = el.getBoundingClientRect();
          // Element is after the posts container (below it)
          return elRect.top > postsContainerRect.bottom;
        });

        if (nextFocusable) {
          e.preventDefault();
          nextFocusable.focus();
        }
        return;
      }

      // Page Down: Move focus to the next article in the feed
      if (e.key === 'PageDown') {
        e.preventDefault();
        const articles = Array.from(feed.querySelectorAll<HTMLElement>('article[tabindex="0"]')) as HTMLElement[];
        const currentArticleIndex = findCurrentArticleIndex(activeElement, articles);

        if (currentArticleIndex >= 0 && currentArticleIndex < articles.length - 1) {
          articles[currentArticleIndex + 1].focus();
        } else if (currentArticleIndex === -1 && articles.length > 0) {
          articles[0].focus();
        }
        return;
      }

      // Page Up: Move focus to the previous article in the feed
      if (e.key === 'PageUp') {
        e.preventDefault();
        const articles = Array.from(feed.querySelectorAll<HTMLElement>('article[tabindex="0"]')) as HTMLElement[];
        const currentArticleIndex = findCurrentArticleIndex(activeElement, articles);

        if (currentArticleIndex > 0) {
          articles[currentArticleIndex - 1].focus();
        } else if (currentArticleIndex === -1 && articles.length > 0) {
          articles[0].focus();
        }
        return;
      }

      // Ctrl/Cmd + Home: Move focus to the first article in the feed
      if ((e.key === 'Home' || e.code === 'Home') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();

        // Find all articles in the feed
        const articles = Array.from(feed.querySelectorAll<HTMLElement>('article[tabindex="0"]')) as HTMLElement[];

        if (articles.length > 0) {
          // Focus the first article
          articles[0].focus();
        }
        return;
      }

      // Ctrl/Cmd + End: Move focus to the first focusable element after the feed
      if (!isInDrawer && (e.key === 'End' || e.code === 'End') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();

        const visibleFocusableElements = allFocusableElements.filter(
          (el) => !feed.contains(el) && isElementVisible(el) && el.tagName !== 'ARTICLE',
        );

        // Find first element after feed in document order
        let targetElement: HTMLElement | null = null;
        for (const el of visibleFocusableElements) {
          if (feed.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) {
            targetElement = el;
            break;
          }
        }

        if (targetElement) {
          targetElement.focus();
          
          // VoiceOver may move focus to an article after our handler runs.
          // Use requestAnimationFrame in a loop to continuously monitor and correct focus
          // for a short period to catch VoiceOver's delayed focus changes.
          let correctionAttempts = 0;
          const maxAttempts = 10; // Check for ~160ms (10 frames at ~16ms each)
          
          const correctFocus = () => {
            const currentFocus = document.activeElement;
            if (currentFocus && currentFocus.tagName === 'ARTICLE' && feed.contains(currentFocus)) {
              targetElement?.focus();
              correctionAttempts++;
              if (correctionAttempts < maxAttempts) {
                requestAnimationFrame(correctFocus);
              }
            }
          };
          
          // Start checking after a brief delay to let VoiceOver do its thing
          setTimeout(() => {
            requestAnimationFrame(correctFocus);
          }, 10);
        }
        return;
      }
    };

    // Add event listener to the feed for keyboard navigation
    feed.addEventListener('keydown', handleKeyDown);

    /**
     * Document-level keyboard handler for Ctrl/Cmd+Home/End.
     * Uses capture phase to intercept these keys before browser default behavior.
     * This is necessary because browsers have default behaviors for these key combinations.
     */
    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      // Only handle Control+Home and Control+End
      if (
        !((e.key === 'Home' || e.code === 'Home' || e.key === 'End' || e.code === 'End') && (e.ctrlKey || e.metaKey))
      ) {
        return;
      }

      // Check if focus is currently within the feed
      const activeElement = document.activeElement;
      if (!activeElement || !feed.contains(activeElement)) {
        return;
      }

      // Call the main handler for these specific keys
      handleKeyDown(e);
    };

    document.addEventListener('keydown', handleDocumentKeyDown, true); // Use capture phase

    return () => {
      feed.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleDocumentKeyDown, true);
    };
  }, [postsContainerRef, feedRef]);
}

