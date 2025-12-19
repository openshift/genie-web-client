import { useCallback, useRef } from 'react';

/**
 * Custom hook to manage the IntersectionObserver for infinite scroll.
 * Detects when the user scrolls to the last item and triggers loading the next page.
 * 
 * @param isLoading - Whether items are currently being loaded
 * @param endOfData - Whether all data has been loaded
 * @param isInfiniteScrollEnabled - Whether infinite scroll is enabled
 * @param increasePage - Callback to increment the page number
 * @param loadingDataErrorMessage - Error message if there is an error loading data
 * @returns Ref callback to attach to the last item in the list
 */
export function useInfiniteScrollObserver(
  isLoading: boolean,
  endOfData: boolean,
  isInfiniteScrollEnabled: boolean,
  increasePage: () => void,
  loadingDataErrorMessage?: string
) {
  /** IntersectionObserver instance for detecting when user scrolls to the last item */
  const observer = useRef<IntersectionObserver>();

  /**
   * Callback ref for the last item in the list.
   * Sets up an IntersectionObserver to detect when the user scrolls to the bottom,
   * then automatically loads the next page if infinite scroll is enabled.
   */
  const lastPostElementRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect any existing observer first
      if (observer.current) {
        observer.current.disconnect();
      }

      // Don't observe if loading, no more data, infinite scroll is disabled, or there is an error
      if (isLoading || endOfData || !isInfiniteScrollEnabled || loadingDataErrorMessage || !node) {
        return;
      }

      // Create new observer to watch when the last item comes into view
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          increasePage();
        }
      });

      // Start observing the last item
      observer.current.observe(node);
    },
    [isLoading, endOfData, isInfiniteScrollEnabled, increasePage, loadingDataErrorMessage],
  );

  return lastPostElementRef;
}

