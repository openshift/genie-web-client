import { Skeleton } from '@patternfly/react-core';

export type InfiniteScrollLoadingIndicatorProps = {
  /** Whether items are currently being loaded */
  isLoading: boolean;
  /** Number of items currently loaded */
  itemsCount: number;
  /** Number of items per page (for display) */
  itemsPerPage?: number;
};

/**
 * Loading indicator component that displays a spinner when items are being loaded.
 */
export default function InfiniteScrollLoadingIndicator({
  isLoading,
  itemsCount,
  itemsPerPage,
}: InfiniteScrollLoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div role="status" aria-live="polite">
      <Skeleton
        screenreaderText={`Loading ${
          itemsCount !== 0 && itemsPerPage ? `${itemsPerPage} more ` : ''
        }...`}
      />
      <Skeleton className="pf-v6-u-mt-md" width="50%" />
      <Skeleton className="pf-v6-u-mt-md" width="75%" />
    </div>
  );
}
