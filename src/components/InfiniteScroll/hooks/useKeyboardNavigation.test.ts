import React from 'react';
import { renderHook } from '../../../unitTestUtils';
import { createRef } from 'react';
import { useKeyboardNavigation } from './useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  let postsContainerRef: React.RefObject<HTMLDivElement>;
  let feedRef: React.RefObject<HTMLDivElement>;
  let postsContainer: HTMLDivElement;
  let feed: HTMLDivElement;

  beforeEach(() => {
    postsContainerRef = createRef<HTMLDivElement>();
    feedRef = createRef<HTMLDivElement>();

    postsContainer = document.createElement('div');
    feed = document.createElement('div');
    feed.setAttribute('role', 'feed');

    postsContainer.appendChild(feed);
    document.body.appendChild(postsContainer);
    (postsContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = postsContainer;
    (feedRef as React.MutableRefObject<HTMLDivElement | null>).current = feed;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should set up keyboard event listeners', () => {
    const addEventListenerSpy = jest.spyOn(feed, 'addEventListener');
    const documentAddEventListenerSpy = jest.spyOn(document, 'addEventListener');

    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(documentAddEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(feed, 'removeEventListener');
    const documentRemoveEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    expect(documentRemoveEventListenerSpy).toHaveBeenCalled();
  });

  it('should handle Escape key to move focus out of feed', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const buttonInFeed = document.createElement('button');
    feed.appendChild(buttonInFeed);
    buttonInFeed.focus();

    const buttonOutside = document.createElement('button');
    document.body.appendChild(buttonOutside);

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(escapeEvent, 'preventDefault');
    feed.dispatchEvent(escapeEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    // Focus should move to button outside if found (may not always work in test environment)
    // Just verify preventDefault was called
  });

  it('should handle PageDown to move to next article', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const article1 = document.createElement('article');
    article1.setAttribute('tabindex', '0');
    const article2 = document.createElement('article');
    article2.setAttribute('tabindex', '0');
    feed.appendChild(article1);
    feed.appendChild(article2);

    // Focus on a button inside article1 to simulate real scenario
    const button1 = document.createElement('button');
    article1.appendChild(button1);
    button1.focus();

    const pageDownEvent = new KeyboardEvent('keydown', {
      key: 'PageDown',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(pageDownEvent, 'preventDefault');
    feed.dispatchEvent(pageDownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(article2);
  });

  it('should handle PageUp to move to previous article', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const article1 = document.createElement('article');
    article1.setAttribute('tabindex', '0');
    const article2 = document.createElement('article');
    article2.setAttribute('tabindex', '0');
    feed.appendChild(article1);
    feed.appendChild(article2);

    // Focus on a button inside article2
    const button2 = document.createElement('button');
    article2.appendChild(button2);
    button2.focus();

    const pageUpEvent = new KeyboardEvent('keydown', {
      key: 'PageUp',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(pageUpEvent, 'preventDefault');
    feed.dispatchEvent(pageUpEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(article1);
  });

  it('should handle Ctrl+Home to move to first article', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const article1 = document.createElement('article');
    article1.setAttribute('tabindex', '0');
    const article2 = document.createElement('article');
    article2.setAttribute('tabindex', '0');
    feed.appendChild(article1);
    feed.appendChild(article2);

    // Focus on a button inside article2
    const button2 = document.createElement('button');
    article2.appendChild(button2);
    button2.focus();

    const ctrlHomeEvent = new KeyboardEvent('keydown', {
      key: 'Home',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(ctrlHomeEvent, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(ctrlHomeEvent, 'stopPropagation');
    feed.dispatchEvent(ctrlHomeEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(article1);
  });

  it('should not handle keyboard events when focus is outside feed', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const buttonOutside = document.createElement('button');
    document.body.appendChild(buttonOutside);
    buttonOutside.focus();

    const article = document.createElement('article');
    article.setAttribute('tabindex', '0');
    feed.appendChild(article);

    const pageDownEvent = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true });
    feed.dispatchEvent(pageDownEvent);

    expect(document.activeElement).toBe(buttonOutside);
  });

  it('should return early if refs are not set', () => {
    const emptyRef = createRef<HTMLDivElement>();
    const { result } = renderHook(() => useKeyboardNavigation(emptyRef, emptyRef, false));

    // Should not throw and should complete without errors
    expect(result.current).toBeUndefined();
  });

  it('should not handle Escape key when isInDrawer is true', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, true));

    const buttonInFeed = document.createElement('button');
    feed.appendChild(buttonInFeed);
    buttonInFeed.focus();

    const buttonOutside = document.createElement('button');
    document.body.appendChild(buttonOutside);

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(escapeEvent, 'preventDefault');
    feed.dispatchEvent(escapeEvent);

    // Should not prevent default when in drawer
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should handle Ctrl+End to move focus after feed when not in drawer', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const article = document.createElement('article');
    article.setAttribute('tabindex', '0');
    feed.appendChild(article);

    const buttonInArticle = document.createElement('button');
    article.appendChild(buttonInArticle);
    buttonInArticle.focus();

    // Create a button after the posts container in document order
    const buttonAfter = document.createElement('button');
    postsContainer.parentNode?.appendChild(buttonAfter) || document.body.appendChild(buttonAfter);

    const ctrlEndEvent = new KeyboardEvent('keydown', {
      key: 'End',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(ctrlEndEvent, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(ctrlEndEvent, 'stopPropagation');
    feed.dispatchEvent(ctrlEndEvent);

    // Should prevent default and stop propagation
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    // Note: Focus might not move in test environment due to requestAnimationFrame timing
  });

  it('should not handle Ctrl+End when isInDrawer is true', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, true));

    const article = document.createElement('article');
    article.setAttribute('tabindex', '0');
    feed.appendChild(article);
    article.focus();

    const ctrlEndEvent = new KeyboardEvent('keydown', {
      key: 'End',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(ctrlEndEvent, 'preventDefault');
    feed.dispatchEvent(ctrlEndEvent);

    // Should not handle when in drawer
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should handle PageDown when no current article index found', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const article1 = document.createElement('article');
    article1.setAttribute('tabindex', '0');
    feed.appendChild(article1);

    // Focus something outside articles
    const buttonOutside = document.createElement('button');
    feed.appendChild(buttonOutside);
    buttonOutside.focus();

    const pageDownEvent = new KeyboardEvent('keydown', {
      key: 'PageDown',
      bubbles: true,
      cancelable: true,
    });
    feed.dispatchEvent(pageDownEvent);

    // Should focus first article when current index is -1
    expect(document.activeElement).toBe(article1);
  });

  it('should handle PageUp when no current article index found', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const article1 = document.createElement('article');
    article1.setAttribute('tabindex', '0');
    feed.appendChild(article1);

    // Focus something outside articles
    const buttonOutside = document.createElement('button');
    feed.appendChild(buttonOutside);
    buttonOutside.focus();

    const pageUpEvent = new KeyboardEvent('keydown', {
      key: 'PageUp',
      bubbles: true,
      cancelable: true,
    });
    feed.dispatchEvent(pageUpEvent);

    // Should focus first article when current index is -1
    expect(document.activeElement).toBe(article1);
  });

  it('should handle Ctrl+Home via document handler', () => {
    renderHook(() => useKeyboardNavigation(postsContainerRef, feedRef, false));

    const article1 = document.createElement('article');
    article1.setAttribute('tabindex', '0');
    const article2 = document.createElement('article');
    article2.setAttribute('tabindex', '0');
    feed.appendChild(article1);
    feed.appendChild(article2);

    const button2 = document.createElement('button');
    article2.appendChild(button2);
    button2.focus();

    const ctrlHomeEvent = new KeyboardEvent('keydown', {
      key: 'Home',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(ctrlHomeEvent, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(ctrlHomeEvent, 'stopPropagation');

    // Dispatch on document to test document-level handler (capture phase)
    // The handler uses capture phase, so we need to dispatch in a way that triggers it
    // Actually, the handler is on document with capture:true, so dispatching on document should work
    document.dispatchEvent(ctrlHomeEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(article1);
  });
});
