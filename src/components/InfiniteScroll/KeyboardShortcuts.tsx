import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { setText, textType } from './text';

export type KeyboardShortcutsProps = {
  /** If true, indicates that the infinite scroll is in a drawer. */
  isInDrawer?: boolean;
  text?: textType;
};

/**
 * Component that displays keyboard shortcuts for the infinite scroll feed.
 */
export default function KeyboardShortcuts({ isInDrawer = false, text }: KeyboardShortcutsProps) {
  const customText = setText(text);
  return (
    <>
      <div className="pf-v6-u-font-size-sm pf-v6-u-font-weight-bold pf-v6-u-mt-md pf-v6-u-mb-md">
        {customText.keyboardShortcuts}:
      </div>
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>{customText.escapeKey}</DescriptionListTerm>
          <DescriptionListDescription>{customText.exitList}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{customText.pageDownKey}</DescriptionListTerm>
          <DescriptionListDescription>{customText.moveFocusToNextItem}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{customText.pageUpKey}</DescriptionListTerm>
          <DescriptionListDescription>
            {customText.moveFocusToPreviousItem}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{customText.controlHomeKey}</DescriptionListTerm>
          <DescriptionListDescription>
            {customText.moveFocusToFirstFocusableElementInTheFeed}
          </DescriptionListDescription>
        </DescriptionListGroup>
        {!isInDrawer && (
          <DescriptionListGroup>
            <DescriptionListTerm>{customText.controlEndKey}</DescriptionListTerm>
            <DescriptionListDescription>
              {customText.moveFocusToFirstFocusableElementAfterTheFeed}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
    </>
  );
}
