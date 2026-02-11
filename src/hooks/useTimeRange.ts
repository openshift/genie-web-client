import type { AbsoluteTimeRange, RelativeTimeRange, TimeRangeValue } from '@perses-dev/core';
import { useMemo } from 'react';

export const useTimeRange = (start?: string, end?: string, duration?: string): TimeRangeValue => {
  const result = useMemo(() => {
    let endTime = end;
    if (endTime === 'NOW') {
      // Special placeholder for current-time queries.
      endTime = undefined;
    }
    let timeRange: TimeRangeValue;
    if (start && endTime) {
      timeRange = {
        start: new Date(start),
        end: new Date(endTime),
      } as AbsoluteTimeRange;
    } else {
      timeRange = { pastDuration: duration || '1h' } as RelativeTimeRange;
    }
    return timeRange;
  }, [duration, end, start]);
  return result;
};
