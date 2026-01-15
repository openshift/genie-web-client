import React, { RefObject } from 'react';

export type InfiniteScrollFeedProps = {
  /** Array of items to display */
  items: React.ReactNode[] | string[];
  /** Whether all data has been loaded */
  endOfData: boolean;
  /** Whether items are currently being loaded */
  isLoading: boolean;
  /** Title/label for the items */
  itemsTitle: string;
  /** Ref to the feed container */
  feedRef: RefObject<HTMLDivElement>;
  /** Ref callback for the last item (used for intersection observer) */
  lastPostElementRef: (node: HTMLElement | null) => void;
  /** ARIA label for the feed container */
  ariaFeedLabel?: string;
};

/**
 * Feed container component that displays all items in a feed structure for accessibility.
 */
export default function InfiniteScrollFeed({
  items,
  endOfData,
  isLoading,
  feedRef,
  lastPostElementRef,
  ariaFeedLabel,
}: InfiniteScrollFeedProps) {
  return (
    <div ref={feedRef} role="feed" aria-busy={isLoading} aria-label={ariaFeedLabel}>
      {items.map((item, index) => (
        <article
          key={index}
          aria-posinset={index + 1}
          aria-setsize={endOfData ? items.length : -1}
          tabIndex={0}
          ref={items.length === index + 1 ? lastPostElementRef : null}
        >
          {item}
        </article>
      ))}
    </div>
  );
}
