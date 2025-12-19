import { Switch } from '@patternfly/react-core';
import KeyboardShortcuts from './KeyboardShortcuts';

export type InfiniteScrollSettingsProps = {
  /** Title/label for the items (e.g., "posts", "items", "articles") */
  itemsTitle: string;
  /** Whether automatic infinite scroll is enabled */
  isInfiniteScrollEnabled: boolean;
  /** Callback to toggle infinite scroll on/off */
  onToggleInfiniteScroll: (enabled: boolean) => void;
  /** If true, indicates that the infinite scroll is in a drawer. */
  isInDrawer?: boolean;

  onlyAllowLoadMoreButton?: boolean;
};

/**
 * Settings card component for infinite scroll configuration.
 * Allows users to toggle infinite scroll on/off and displays keyboard shortcuts.
 */
export default function InfiniteScrollSettings({
  itemsTitle,
  isInfiniteScrollEnabled,
  onToggleInfiniteScroll,
  isInDrawer = false,
  onlyAllowLoadMoreButton = false,
}: InfiniteScrollSettingsProps) {
  return (
    <>
      {!onlyAllowLoadMoreButton && (
        <Switch
          label={`Enable automatic loading of new ${itemsTitle}`}
          id="checked-with-label-switch-on"
          isChecked={isInfiniteScrollEnabled}
          hasCheckIcon
          onChange={() => onToggleInfiniteScroll(!isInfiniteScrollEnabled)}
        />
      )}
      <KeyboardShortcuts isInDrawer={isInDrawer} />
    </>
  );
}
