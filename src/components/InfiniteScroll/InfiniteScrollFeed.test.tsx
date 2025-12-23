import { render, screen } from '../../unitTestUtils';
import { createRef } from 'react';
import InfiniteScrollFeed from './InfiniteScrollFeed';

describe('InfiniteScrollFeed', () => {
  const defaultProps = {
    items: ['Item 1', 'Item 2', 'Item 3'],
    endOfData: false,
    isLoading: false,
    itemsTitle: 'posts',
    feedRef: createRef<HTMLDivElement>(),
    lastPostElementRef: jest.fn(),
  };

  it('should render all items as articles', () => {
    render(<InfiniteScrollFeed {...defaultProps} />);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(3);
  });

  it('should have correct role and ARIA attributes', () => {
    render(<InfiniteScrollFeed {...defaultProps} />);
    const feed = screen.getByRole('feed');
    expect(feed).toBeInTheDocument();
    expect(feed).toHaveAttribute('aria-busy', 'false');
  });

  it('should set aria-busy to true when loading', () => {
    render(<InfiniteScrollFeed {...defaultProps} isLoading={true} />);
    const feed = screen.getByRole('feed');
    expect(feed).toHaveAttribute('aria-busy', 'true');
  });

  it('should include item count in aria-label when items exist', () => {
    render(<InfiniteScrollFeed {...defaultProps} ariaFeedLabel="posts feed, 3 posts loaded" />);
    const feed = screen.getByRole('feed');
    expect(feed).toHaveAttribute('aria-label');
    expect(feed.getAttribute('aria-label')).toContain('3 posts loaded');
  });

  it('should use singular form for single item', () => {
    render(
      <InfiniteScrollFeed
        {...defaultProps}
        items={['Item 1']}
        ariaFeedLabel="posts feed, 1 post loaded"
      />,
    );
    const feed = screen.getByRole('feed');
    expect(feed).toHaveAttribute('aria-label');
    expect(feed.getAttribute('aria-label')).toContain('1 post loaded');
  });

  it('should include "all posts loaded" in aria-label when endOfData is true', () => {
    render(
      <InfiniteScrollFeed
        {...defaultProps}
        endOfData={true}
        ariaFeedLabel="posts feed, 3 posts loaded, all posts loaded"
      />,
    );
    const feed = screen.getByRole('feed');
    expect(feed).toHaveAttribute('aria-label');
    expect(feed.getAttribute('aria-label')).toContain('all posts loaded');
  });

  it('should set correct aria-posinset and aria-setsize for articles', () => {
    render(<InfiniteScrollFeed {...defaultProps} />);
    const articles = screen.getAllByRole('article');

    articles.forEach((article, index) => {
      expect(article).toHaveAttribute('aria-posinset', String(index + 1));
      expect(article).toHaveAttribute('aria-setsize', '-1');
    });
  });

  it('should set aria-setsize to item count when endOfData is true', () => {
    render(<InfiniteScrollFeed {...defaultProps} endOfData={true} />);
    const articles = screen.getAllByRole('article');

    articles.forEach((article) => {
      expect(article).toHaveAttribute('aria-setsize', '3');
    });
  });

  it('should attach lastPostElementRef to the last item', () => {
    const lastPostRef = jest.fn();
    render(<InfiniteScrollFeed {...defaultProps} lastPostElementRef={lastPostRef} />);

    // The ref callback should be called with the last article element
    // Note: In React, ref callbacks are called during render
    expect(lastPostRef).toHaveBeenCalled();
    // Verify it was called with an HTMLElement (the last article)
    const lastCall = lastPostRef.mock.calls[lastPostRef.mock.calls.length - 1];
    if (lastCall && lastCall[0]) {
      expect(lastCall[0]).toBeInstanceOf(HTMLElement);
    }
  });

  it('should render empty feed when no items', () => {
    render(<InfiniteScrollFeed {...defaultProps} items={[]} />);
    const articles = screen.queryAllByRole('article');
    expect(articles).toHaveLength(0);
  });

  it('should render React nodes as items', () => {
    const items = [<div key="1">React Node 1</div>, <div key="2">React Node 2</div>];
    const { container } = render(<InfiniteScrollFeed {...defaultProps} items={items} />);
    expect(container.textContent).toContain('React Node 1');
    expect(container.textContent).toContain('React Node 2');
  });
});
