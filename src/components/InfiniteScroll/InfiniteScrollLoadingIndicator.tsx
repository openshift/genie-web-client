import { Skeleton } from '@patternfly/react-core';
import { setText, textType } from './text';

export type InfiniteScrollLoadingIndicatorProps = {
  /** Whether items are currently being loaded */
  isLoading: boolean;
  text?: textType;
};

/**
 * Loading indicator component that displays a spinner when items are being loaded.
 */
export default function InfiniteScrollLoadingIndicator({
  isLoading,
  text,
}: InfiniteScrollLoadingIndicatorProps) {
  const customText = setText(text);
  if (!isLoading) return null;

  return (
    <div role="status" aria-live="polite">
      <Skeleton screenreaderText={customText.loadingMore} />
      <Skeleton className="pf-v6-u-mt-md" width="50%" />
      <Skeleton className="pf-v6-u-mt-md" width="75%" />
    </div>
  );
}
