import type { TimestampProps } from '@patternfly/react-core';

/**
 * Standard timestamp format settings for consistent date/time display across the app.
 * Use these with PatternFly's Timestamp component.
 */
export const STANDARD_TIMESTAMP_FORMAT: Pick<
  TimestampProps,
  'dateFormat' | 'timeFormat' | 'is12Hour'
> = {
  dateFormat: 'short',
  timeFormat: 'short',
  is12Hour: true,
};
