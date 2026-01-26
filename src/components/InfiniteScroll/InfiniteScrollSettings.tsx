import { Switch } from '@patternfly/react-core';
import KeyboardShortcuts from './KeyboardShortcuts';
import { setText, textType } from './text';

export type InfiniteScrollSettingsProps = {
  /** Whether automatic infinite scroll is enabled */
  isInfiniteScrollEnabled: boolean;
  /** Callback to toggle infinite scroll on/off */
  onToggleInfiniteScroll: (enabled: boolean) => void;
  /** If true, indicates that the infinite scroll is in a drawer. */
  isInDrawer?: boolean;

  onlyAllowLoadMoreButton?: boolean;
  text?: textType;
};

/**
 * Settings card component for infinite scroll configuration.
 * Allows users to toggle infinite scroll on/off and displays keyboard shortcuts.
 */
export default function InfiniteScrollSettings({
  isInfiniteScrollEnabled,
  onToggleInfiniteScroll,
  isInDrawer = false,
  onlyAllowLoadMoreButton = false,
  text,
}: InfiniteScrollSettingsProps) {
  const customText = setText(text);
  return (
    <>
      {!onlyAllowLoadMoreButton && (
        <Switch
          label={customText.enableAutomaticLoadingOfNew}
          id="checked-with-label-switch-on"
          isChecked={isInfiniteScrollEnabled}
          hasCheckIcon
          onChange={() => onToggleInfiniteScroll(!isInfiniteScrollEnabled)}
        />
      )}
      <KeyboardShortcuts isInDrawer={isInDrawer} text={customText} />
    </>
  );
}
