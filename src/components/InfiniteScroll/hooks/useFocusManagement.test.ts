import React from 'react';
import { renderHook } from '../../../unitTestUtils';
import { createRef } from 'react';
import { useFocusManagement } from './useFocusManagement';

describe('useFocusManagement', () => {
  let feedRef: React.RefObject<HTMLDivElement>;
  let loadMoreButtonRef: React.RefObject<HTMLButtonElement>;
  let previousPostCountRef: { current: number };
  let loadMoreButtonHadFocusRef: { current: boolean };

  beforeEach(() => {
    jest.useFakeTimers();
    feedRef = createRef<HTMLDivElement>();
    loadMoreButtonRef = createRef<HTMLButtonElement>();

    const feed = document.createElement('div');
    (feedRef as React.MutableRefObject<HTMLDivElement | null>).current = feed;
    document.body.appendChild(feed);

    const button = document.createElement('button');
    (loadMoreButtonRef as React.MutableRefObject<HTMLButtonElement | null>).current = button;
    document.body.appendChild(button);

    previousPostCountRef = { current: 5 };
    loadMoreButtonHadFocusRef = { current: true };

    // Clear any existing focus spies
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should not move focus if infinite scroll is enabled', () => {
    const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: true,
        isLoading: false,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should not move focus if still loading', () => {
    const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: true,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should not move focus if no new items were added', () => {
    const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 5,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should not move focus if button did not have focus', () => {
    const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');
    loadMoreButtonHadFocusRef.current = false;

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should move focus to first new article when conditions are met', () => {
    // Create articles - previousPostCountRef is 5, so we need at least 6 articles
    // The first new article would be at index 5
    for (let i = 0; i < 6; i++) {
      const article = document.createElement('article');
      article.setAttribute('tabindex', '0');
      feedRef.current?.appendChild(article);
    }

    loadMoreButtonRef.current?.focus();

    const articles = feedRef.current?.querySelectorAll('article');
    const firstNewArticle = articles?.[5] as HTMLElement;
    const focusSpy = jest.spyOn(firstNewArticle, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should focus article itself even when it contains focusable elements', () => {
    // Create 5 articles first (previousPostCountRef is 5)
    for (let i = 0; i < 5; i++) {
      const article = document.createElement('article');
      article.setAttribute('tabindex', '0');
      feedRef?.current?.appendChild(article);
    }

    // Create the first new article (index 5) with a button inside
    const article = document.createElement('article');
    article.setAttribute('tabindex', '0');
    const button = document.createElement('button');
    article.appendChild(button);
    feedRef.current?.appendChild(article);

    loadMoreButtonRef.current?.focus();

    // Create spy on the article itself (implementation focuses article, not focusable elements within)
    const articleFocusSpy = jest.spyOn(article, 'focus');
    const buttonFocusSpy = jest.spyOn(button, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    // The implementation focuses the article itself, not focusable elements within it
    expect(articleFocusSpy).toHaveBeenCalled();
    expect(buttonFocusSpy).not.toHaveBeenCalled();
  });

  it('should focus article itself if no focusable element within', () => {
    // Create 5 articles first (previousPostCountRef is 5)
    for (let i = 0; i < 5; i++) {
      const article = document.createElement('article');
      article.setAttribute('tabindex', '0');
      feedRef.current?.appendChild(article);
    }

    // Create the first new article (index 5) without focusable children
    const article = document.createElement('article');
    article.setAttribute('tabindex', '0');
    feedRef.current?.appendChild(article);

    loadMoreButtonRef.current?.focus();

    const articleFocusSpy = jest.spyOn(article, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    expect(articleFocusSpy).toHaveBeenCalled();
  });

  it('should reset loadMoreButtonHadFocusRef after attempting to move focus', () => {
    // Create 5 articles first (previousPostCountRef is 5)
    for (let i = 0; i < 5; i++) {
      const article = document.createElement('article');
      article.setAttribute('tabindex', '0');
      feedRef.current?.appendChild(article);
    }

    // Create the first new article (index 5)
    const article = document.createElement('article');
    article.setAttribute('tabindex', '0');
    feedRef.current?.appendChild(article);

    loadMoreButtonRef.current?.focus();

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    expect(loadMoreButtonHadFocusRef.current).toBe(true);
    jest.advanceTimersByTime(100);
    expect(loadMoreButtonHadFocusRef.current).toBe(false);
  });

  it('should not move focus if button no longer has focus', () => {
    // Clear any previous mocks
    jest.clearAllMocks();

    // Create 5 articles first (previousPostCountRef is 5)
    for (let i = 0; i < 5; i++) {
      const article = document.createElement('article');
      article.setAttribute('tabindex', '0');
      feedRef.current?.appendChild(article);
    }

    // Create the first new article (index 5)
    const article = document.createElement('article');
    article.setAttribute('tabindex', '0');
    feedRef.current?.appendChild(article);

    // Don't focus the button - set loadMoreButtonHadFocusRef to false
    loadMoreButtonHadFocusRef.current = false;

    // Create spy only on this specific article element
    const focusSpy = jest.spyOn(article, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    // Should not focus because loadMoreButtonHadFocusRef is false
    // The hook checks this condition first (line 36), so the setTimeout should never run
    // If focusSpy was called, it means the hook incorrectly tried to focus
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should not move focus if feedRef.current is null', () => {
    const nullFeedRef: React.RefObject<HTMLDivElement> = { current: null };

    loadMoreButtonRef.current?.focus();

    const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 10,
        feedRef: nullFeedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should not move focus if first new article is not found', () => {
    // Create only 4 articles (less than previousPostCountRef which is 5)
    for (let i = 0; i < 4; i++) {
      const article = document.createElement('article');
      article.setAttribute('tabindex', '0');
      feedRef.current?.appendChild(article);
    }

    loadMoreButtonRef.current?.focus();

    const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');

    renderHook(() =>
      useFocusManagement({
        isInfiniteScrollEnabled: false,
        isLoading: false,
        itemsLength: 10,
        feedRef,
        loadMoreButtonRef,
        previousPostCountRef,
        loadMoreButtonHadFocusRef,
      }),
    );

    jest.advanceTimersByTime(100);
    // Should not focus because article at index 5 doesn't exist
    expect(focusSpy).not.toHaveBeenCalled();
  });
});
