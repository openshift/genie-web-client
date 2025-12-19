/**
 * CSS selector string for all focusable elements in the document.
 * Used for keyboard navigation and focus management.
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Gets all focusable elements in the document.
 * @returns Array of focusable HTMLElements
 */
export const getAllFocusableElements = (): HTMLElement[] => {
  return Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
};

/**
 * Checks if an element is visible on the page.
 * @param el - The element to check
 * @returns true if the element is visible, false otherwise
 */
export const isElementVisible = (el: HTMLElement): boolean => {
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  if (el.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  return true;
};

/**
 * Finds the index of the article that contains or is the currently active element.
 * @param activeElement - The currently focused element
 * @param articles - Array of article elements to search through
 * @returns The index of the article, or -1 if not found
 */
export const findCurrentArticleIndex = (activeElement: Element | null, articles: HTMLElement[]): number => {
  if (!(activeElement instanceof HTMLElement)) return -1;

  // If the active element is itself an article, return its index
  if (activeElement.tagName === 'ARTICLE' && articles.includes(activeElement)) {
    return articles.indexOf(activeElement);
  }

  // Otherwise, find which article contains the active element
  return articles.findIndex((article) => article.contains(activeElement));
};

