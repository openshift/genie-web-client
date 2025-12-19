import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage page loading logic for infinite scroll.
 * Handles initial page load and subsequent page loads, preventing duplicate loads.
 * 
 * @param initialPage - The initial page number to load
 * @param page - Current page number
 * @param endOfData - Whether all data has been loaded
 * @param fetchMoreItems - Callback to fetch more items
 */
export function usePageLoader(
  initialPage: number,
  page: number,
  endOfData: boolean,
  fetchMoreItems: (page: number) => void
) {
  /** Set of page numbers that have already been loaded (prevents duplicate loads) */
  const loadedPagesRef = useRef<Set<number>>(new Set());
  /** Flag to track if the initial page has been loaded */
  const hasInitialBulkLoadRef = useRef(false);

  /**
   * Initial load effect: Loads the initial page on component mount.
   * Only runs once to prevent duplicate initial loads.
   */
  useEffect(() => {
    // Skip if initial load has already been performed
    if (hasInitialBulkLoadRef.current) return;
    
    hasInitialBulkLoadRef.current = true;
    
    // Load initial page if it hasn't been loaded yet
    if (!loadedPagesRef.current.has(initialPage)) {
      loadedPagesRef.current.add(initialPage);
      fetchMoreItems(initialPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /**
   * Page change effect: Loads subsequent pages when the page number changes.
   * Only runs after the initial load is complete and prevents duplicate page loads.
   */
  useEffect(() => {
    // Don't load if initial load hasn't completed or if we've reached the end of data
    if (!hasInitialBulkLoadRef.current || endOfData) return;

    // Only load if this page hasn't been loaded yet (prevents duplicate loads)
    if (!loadedPagesRef.current.has(page)) {
      loadedPagesRef.current.add(page);
      fetchMoreItems(page);
    }
  }, [page, endOfData, fetchMoreItems]);
}

