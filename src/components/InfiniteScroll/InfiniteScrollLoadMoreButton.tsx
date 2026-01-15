import { Button } from '@patternfly/react-core';
import { MutableRefObject, RefObject, useEffect } from 'react';
import InfiniteScrollLoadingIndicator from './InfiniteScrollLoadingIndicator';
import { RedoIcon } from '@patternfly/react-icons';
import { setText, textType } from './text';

export type InfiniteScrollLoadMoreButtonProps = {
  /** Whether items are currently being loaded */
  isLoading: boolean;

  /** Number of items per page */
  itemsPerPage?: number;
  /** Ref to the button element */
  loadMoreButtonRef: RefObject<HTMLButtonElement>;
  /** Ref to the loading indicator container */
  loadingIndicatorContainerRef: RefObject<HTMLParagraphElement>;
  /** Current number of items (for tracking before load) */
  itemsCount: number;
  /** Ref tracking the item count before loading */
  previousPostCountRef: MutableRefObject<number>;
  /** Ref tracking if button had focus when clicked */
  loadMoreButtonHadFocusRef: MutableRefObject<boolean>;
  /** Callback when button is clicked */
  onLoadMore: () => void;
  text?: textType;
};

/**
 * Load more button component that appears when infinite scroll is disabled.
 * Handles focus tracking for accessibility when new content is loaded.
 */
export default function InfiniteScrollLoadMoreButton({
  isLoading,
  loadMoreButtonRef,
  loadingIndicatorContainerRef,
  itemsCount,
  previousPostCountRef,
  loadMoreButtonHadFocusRef,
  onLoadMore,
  text,
}: InfiniteScrollLoadMoreButtonProps) {
  const customText = setText(text);
  const handleClick = () => {
    // Store the current item count before loading (for focus management)
    previousPostCountRef.current = itemsCount;
    // Track if the button has focus (for focus management after loading)
    loadMoreButtonHadFocusRef.current = document.activeElement === loadMoreButtonRef.current;
    // Trigger loading the next page
    onLoadMore();
  };

  // Focus the loading indicator container when loading starts (only if button had focus when clicked)
  useEffect(() => {
    if (isLoading && loadingIndicatorContainerRef.current && loadMoreButtonHadFocusRef.current) {
      // Make the container focusable if it isn't already
      if (!loadingIndicatorContainerRef.current.hasAttribute('tabindex')) {
        loadingIndicatorContainerRef.current.setAttribute('tabindex', '-1');
      }
      // Focus the container to maintain accessibility when button is hidden
      loadingIndicatorContainerRef.current.focus();
    }
  }, [isLoading, loadingIndicatorContainerRef, loadMoreButtonHadFocusRef]);

  return (
    <div ref={loadingIndicatorContainerRef}>
      {isLoading ? (
        <>
          <span className="pf-v6-u-screen-reader">
            {customText.newContentWillReceiveFocusOnceLoaded}
          </span>
          <InfiniteScrollLoadingIndicator isLoading={isLoading} text={customText} />
        </>
      ) : (
        <Button
          ref={loadMoreButtonRef}
          onClick={handleClick}
          isAriaDisabled={isLoading}
          icon={<RedoIcon aria-hidden="true" />}
        >
          {customText.loadMore}
        </Button>
      )}
    </div>
  );
}
