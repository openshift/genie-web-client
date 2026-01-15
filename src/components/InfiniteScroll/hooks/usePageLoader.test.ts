import { renderHook, waitFor } from '../../../unitTestUtils';
import { usePageLoader } from './usePageLoader';

describe('usePageLoader', () => {
  const mockFetchMoreItems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call fetchMoreItems with initialPage on mount', async () => {
    renderHook(() => usePageLoader(1, 1, false, mockFetchMoreItems));

    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledWith(1);
    });
    expect(mockFetchMoreItems).toHaveBeenCalledTimes(1);
  });

  it('should not call fetchMoreItems again if initial page already loaded', async () => {
    const { rerender } = renderHook(
      ({ initialPage, page }) => usePageLoader(initialPage, page, false, mockFetchMoreItems),
      { initialProps: { initialPage: 1, page: 1 } },
    );

    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledTimes(1);
    });

    rerender({ initialPage: 1, page: 1 });
    // Should still be called only once
    expect(mockFetchMoreItems).toHaveBeenCalledTimes(1);
  });

  it('should call fetchMoreItems when page changes', async () => {
    const { rerender } = renderHook(
      ({ page }) => usePageLoader(1, page, false, mockFetchMoreItems),
      { initialProps: { page: 1 } },
    );

    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledWith(1);
      expect(mockFetchMoreItems).toHaveBeenCalledTimes(1);
    });

    rerender({ page: 2 });
    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledWith(2);
      expect(mockFetchMoreItems).toHaveBeenCalledTimes(2);
    });
  });

  it('should not call fetchMoreItems if page already loaded', async () => {
    const { rerender } = renderHook(
      ({ page }) => usePageLoader(1, page, false, mockFetchMoreItems),
      { initialProps: { page: 1 } },
    );

    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledTimes(1);
    });

    rerender({ page: 2 });
    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledTimes(2);
    });

    rerender({ page: 2 });
    // Should not call again for the same page
    expect(mockFetchMoreItems).toHaveBeenCalledTimes(2);
  });

  it('should not call fetchMoreItems if endOfData is true', async () => {
    renderHook(() => usePageLoader(1, 2, true, mockFetchMoreItems));

    await waitFor(() => {
      // Should only call for initial page, not for page 2
      expect(mockFetchMoreItems).toHaveBeenCalledWith(1);
      expect(mockFetchMoreItems).toHaveBeenCalledTimes(1);
    });
  });

  it('should call fetchMoreItems for initial page on each new hook instance', async () => {
    const { unmount } = renderHook(() => usePageLoader(1, 1, false, mockFetchMoreItems));

    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledWith(1);
      expect(mockFetchMoreItems).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Create a new hook instance
    renderHook(() => usePageLoader(1, 1, false, mockFetchMoreItems));

    // Should call again for the new instance
    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledTimes(2);
    });
  });
});
