import { renderHook, act } from '../unitTestUtils';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    // Use modern fake timers which also mock Date.now()
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 100));

    expect(result.current).toBe('initial');
  });

  it('updates value immediately when enough time has passed', () => {
    // Set initial time
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: 'first' },
    });

    expect(result.current).toBe('first');

    // Advance system time past the throttle interval
    jest.setSystemTime(new Date('2024-01-01T00:00:00.100Z'));

    // Rerender with new value - the hook should see that 100ms has passed
    rerender({ value: 'second' });

    // Should update immediately since enough time passed
    expect(result.current).toBe('second');
  });

  it('delays update when called within throttle interval', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: 'first' },
    });

    expect(result.current).toBe('first');

    // Rerender with new value immediately (no time passed)
    rerender({ value: 'second' });

    // Should still be first value (throttled)
    expect(result.current).toBe('first');

    // Advance time to trigger the scheduled update
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Now should be updated
    expect(result.current).toBe('second');
  });

  it('schedules update for remaining time when partially elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: 'first' },
    });

    // Advance time partially
    act(() => {
      jest.advanceTimersByTime(40);
    });

    // Update value
    rerender({ value: 'second' });

    // Should still be throttled
    expect(result.current).toBe('first');

    // Advance remaining time (60ms should trigger the update)
    act(() => {
      jest.advanceTimersByTime(60);
    });

    expect(result.current).toBe('second');
  });

  it('works with object values', () => {
    const obj1 = { count: 1 };
    const obj2 = { count: 2 };

    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: obj1 },
    });

    expect(result.current).toEqual({ count: 1 });

    rerender({ value: obj2 });

    // Still throttled
    expect(result.current).toEqual({ count: 1 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toEqual({ count: 2 });
  });

  it('works with null values', () => {
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: 'initial' as string | null },
    });

    expect(result.current).toBe('initial');

    // Advance system time past the throttle interval
    jest.setSystemTime(new Date('2024-01-01T00:00:00.100Z'));

    // Rerender with null
    rerender({ value: null });

    expect(result.current).toBeNull();
  });

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { rerender, unmount } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: 'first' },
    });

    // Trigger a scheduled update
    rerender({ value: 'second' });

    // Unmount before timeout fires
    unmount();

    // clearTimeout should have been called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('handles rapid value changes correctly', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), {
      initialProps: { value: 1 },
    });

    expect(result.current).toBe(1);

    // Rapid changes
    rerender({ value: 2 });
    rerender({ value: 3 });
    rerender({ value: 4 });

    // Should still be throttled to first value
    expect(result.current).toBe(1);

    // Advance time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should have the latest value after throttle period
    expect(result.current).toBe(4);
  });

  it('uses different throttle intervals correctly', () => {
    const { result: fast, rerender: rerenderFast } = renderHook(
      ({ value }) => useThrottle(value, 50),
      { initialProps: { value: 'fast-1' } },
    );

    const { result: slow, rerender: rerenderSlow } = renderHook(
      ({ value }) => useThrottle(value, 200),
      { initialProps: { value: 'slow-1' } },
    );

    // Update both
    rerenderFast({ value: 'fast-2' });
    rerenderSlow({ value: 'slow-2' });

    // Both should be throttled initially
    expect(fast.current).toBe('fast-1');
    expect(slow.current).toBe('slow-1');

    // Advance 50ms - fast should update
    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(fast.current).toBe('fast-2');
    expect(slow.current).toBe('slow-1');

    // Advance another 150ms - slow should update
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(slow.current).toBe('slow-2');
  });
});
