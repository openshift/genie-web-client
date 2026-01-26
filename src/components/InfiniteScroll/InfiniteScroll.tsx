import React, { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScrollSettings from './InfiniteScrollSettings';
import InfiniteScrollFeed from './InfiniteScrollFeed';
import InfiniteScrollLoadingIndicator from './InfiniteScrollLoadingIndicator';
import InfiniteScrollLoadMoreButton from './InfiniteScrollLoadMoreButton';
import { usePageLoader } from './hooks/usePageLoader';
import { useInfiniteScrollObserver } from './hooks/useInfiniteScrollObserver';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useFocusManagement } from './hooks/useFocusManagement';

import {
  Alert,
  AlertVariant,
  Button,
  Flex,
  FlexItem,
  Popover,
  Title,
} from '@patternfly/react-core';
import { CogIcon, RedoIcon } from '@patternfly/react-icons';
import { setText, textType } from './text';

/**
 * Props for the InfiniteScroll component
 */
export type InfiniteScrollProps = {
  /** Array of items to display. Can be React nodes or strings. */
  items: React.ReactNode[] | string[];
  /** Callback function to fetch more items. Called with the page number to load. */
  fetchMoreItems: (page: number) => void;
  /** If true, indicates that all data has been loaded and no more items will be available. */
  endOfData: boolean;
  /** If true, indicates that items are currently being loaded. */
  isLoading: boolean;

  turnOffInfiniteScrollByDefault?: boolean;

  onlyAllowLoadMoreButton?: boolean;
  /** Title/label for the items (e.g., "posts", "items", "articles"). Used in UI text. */
  itemsTitle?: string;
  /** Number of items per page. Used only for display purposes in loading messages. */
  itemsPerPage?: number;
  /** ARIA label for the feed container. */
  ariaFeedLabel?: string;
  /** Initial page number to start from. Defaults to 1. */
  initialPage?: number;
  /** If true, indicates that the infinite scroll is in a drawer. */
  isInDrawer?: boolean;
  feedTitle?: string;
  loadingDataErrorMessage?: string;
  feedTitleHeadingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  isInfiniteScrollEnabled?: boolean;
  text?: textType;
};

/**
 * InfiniteScroll Component
 *
 * A reusable component that provides infinite scrolling functionality with keyboard navigation
 * and accessibility features. Supports both automatic infinite scroll and manual "Load more" button.
 *
 * Features:
 * - Automatic loading when scrolling to the bottom (when enabled)
 * - Manual "Load more" button when automatic scroll is disabled
 * - Keyboard navigation (Escape, Page Up/Down, Ctrl+Home/End)
 * - Focus management when loading new content
 * - Prevents duplicate page loads
 */
export default function InfiniteScroll({
  items,
  fetchMoreItems,
  endOfData,
  isLoading,
  itemsTitle = 'items',
  itemsPerPage,
  ariaFeedLabel,
  initialPage = 1,
  isInDrawer = false,
  feedTitle,
  turnOffInfiniteScrollByDefault = false,
  onlyAllowLoadMoreButton = false,
  feedTitleHeadingLevel = 'h2',
  loadingDataErrorMessage,
  isInfiniteScrollEnabled: externalControlledInfiniteScrollEnabled,
  text = {} as textType,
}: InfiniteScrollProps) {
  const customText = setText(text);

  // Determine if infinite scroll is externally controlled
  const isExternallyControlled = externalControlledInfiniteScrollEnabled !== undefined;

  // State management
  /** Current page number being displayed/loaded */
  const [page, setPage] = useState(initialPage);
  /** Whether automatic infinite scroll is enabled (internal state, only used when not externally controlled) */
  const [internalInfiniteScrollEnabled, setInternalInfiniteScrollEnabled] = useState(
    !turnOffInfiniteScrollByDefault && !onlyAllowLoadMoreButton,
  );
  /** Whether the settings popover is open */
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Use external value if provided, otherwise use internal state
  const isInfiniteScrollEnabled = isExternallyControlled
    ? externalControlledInfiniteScrollEnabled
    : internalInfiniteScrollEnabled;

  // Use internal setter (only used when not externally controlled, since settings are hidden when externally controlled)
  const setIsInfiniteScrollEnabled = setInternalInfiniteScrollEnabled;

  // Refs for DOM elements
  /** Reference to the main container div */
  const postsContainerRef = useRef<HTMLDivElement>(null);
  /** Reference to the feed container (role="feed") */
  const feedRef = useRef<HTMLDivElement>(null);
  /** Reference to the "Load more" button */
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);
  /** Reference to the loading indicator container (when button is hidden) */
  const loadingIndicatorContainerRef = useRef<HTMLParagraphElement>(null);

  // Refs for tracking focus management
  /** Number of items before the last "Load more" click (for focus management) */
  const previousPostCountRef = useRef(0);
  /** Flag to track if the "Load more" button had focus when clicked (for focus management) */
  const loadMoreButtonHadFocusRef = useRef(false);

  /**
   * Increments the page number, which triggers loading the next page.
   * Does not increment if there is an error.
   */
  const increasePage = useCallback(() => {
    // Don't increase page if there is an error
    if (loadingDataErrorMessage) return;
    setPage((prevPage) => prevPage + 1);
  }, [loadingDataErrorMessage]);

  // Custom hooks
  /** Handles page loading logic (initial load and subsequent pages) */
  usePageLoader(initialPage, page, endOfData, fetchMoreItems);

  /** Handles intersection observer for infinite scroll detection */
  const lastPostElementRef = useInfiniteScrollObserver(
    isLoading,
    endOfData,
    isInfiniteScrollEnabled,
    increasePage,
    loadingDataErrorMessage,
  );

  /** Handles keyboard navigation within the feed */
  useKeyboardNavigation(postsContainerRef, feedRef, isInDrawer);

  /** Handles focus management when new items are loaded */
  useFocusManagement({
    isInfiniteScrollEnabled,
    isLoading,
    itemsLength: items.length,
    feedRef,
    loadMoreButtonRef,
    previousPostCountRef,
    loadMoreButtonHadFocusRef,
  });

  // Handle Escape key when in drawer: close popover first, then let drawer handle it
  const popoverButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isInDrawer || isExternallyControlled) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPopoverOpen) {
        // Close the popover and prevent the event from reaching the drawer
        setIsPopoverOpen(false);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Return focus to the settings button
        popoverButtonRef.current?.focus();
      }
    };

    // Use capture phase to intercept before PatternFly's Popover handler
    document.addEventListener('keydown', handleEscape, true);

    return () => {
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [isInDrawer, isPopoverOpen, isExternallyControlled]);

  return (
    <div ref={postsContainerRef}>
      <Flex>
        <FlexItem>
          <Title headingLevel={feedTitleHeadingLevel}>{feedTitle}</Title>
        </FlexItem>

        {!isExternallyControlled && (
          <FlexItem>
            <Popover
              headerContent={customText.feedSettings}
              headerIcon={<CogIcon />}
              hasAutoWidth
              isVisible={isPopoverOpen}
              shouldClose={() => {
                setIsPopoverOpen(false);
                return true;
              }}
              bodyContent={
                <InfiniteScrollSettings
                  isInfiniteScrollEnabled={isInfiniteScrollEnabled}
                  onToggleInfiniteScroll={setIsInfiniteScrollEnabled}
                  isInDrawer={isInDrawer}
                  onlyAllowLoadMoreButton={onlyAllowLoadMoreButton}
                  text={customText}
                />
              }
              appendTo={() => document.body}
            >
              <Button
                ref={popoverButtonRef}
                isSettings
                variant="plain"
                aria-label={customText.feedSettings}
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              />
            </Popover>
          </FlexItem>
        )}
      </Flex>

      {/* Feed container: Displays all items in a feed structure for accessibility */}
      <InfiniteScrollFeed
        items={items}
        endOfData={endOfData}
        isLoading={isLoading}
        itemsTitle={itemsTitle}
        feedRef={feedRef}
        lastPostElementRef={lastPostElementRef}
        ariaFeedLabel={ariaFeedLabel}
      />

      {/* End of data message: Shown when all items have been loaded */}
      {endOfData && <p>{customText.allLoaded}</p>}

      {/* Loading indicator: Shown when loading and infinite scroll is enabled */}
      {/* The loading indicator when infinite scroll is disabled is shown in the Load more button */}
      {isInfiniteScrollEnabled && (
        <InfiniteScrollLoadingIndicator isLoading={isLoading} text={customText} />
      )}

      {/* Error message: Shown when there is an error loading data */}
      {loadingDataErrorMessage && (
        <Alert
          variant={AlertVariant.warning}
          title={customText.couldNotLoadMore}
          actionLinks={
            <Button icon={<RedoIcon />} onClick={() => fetchMoreItems(page)}>
              {customText.retry}
            </Button>
          }
        >
          {loadingDataErrorMessage}
        </Alert>
      )}

      {/* Load more button: Shown when infinite scroll is disabled and more data is available and there is no error */}
      {!isInfiniteScrollEnabled && !endOfData && !loadingDataErrorMessage && (
        <InfiniteScrollLoadMoreButton
          isLoading={isLoading}
          itemsPerPage={itemsPerPage}
          loadMoreButtonRef={loadMoreButtonRef}
          loadingIndicatorContainerRef={loadingIndicatorContainerRef}
          itemsCount={items.length}
          previousPostCountRef={previousPostCountRef}
          loadMoreButtonHadFocusRef={loadMoreButtonHadFocusRef}
          onLoadMore={increasePage}
          text={customText}
        />
      )}
    </div>
  );
}
