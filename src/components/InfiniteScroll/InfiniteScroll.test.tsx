import { render, screen, user, waitFor } from '../../unitTestUtils';

import InfiniteScroll from './InfiniteScroll';

describe('InfiniteScroll', () => {
  const mockFetchMoreItems = jest.fn();
  const defaultProps = {
    items: ['Item 1', 'Item 2', 'Item 3'],
    fetchMoreItems: mockFetchMoreItems,
    endOfData: false,
    isLoading: false,
    itemsTitle: 'posts',
    itemsPerPage: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with items', () => {
    render(<InfiniteScroll {...defaultProps} />);
    expect(screen.getByRole('feed')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should render settings card', async () => {
    render(<InfiniteScroll {...defaultProps} />);

    // Open the popover to see settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    // Check for the switch label which is in the settings
    expect(screen.getByText(/Enable automatic loading of new/)).toBeInTheDocument();
  });

  it('should call fetchMoreItems with initialPage on mount', async () => {
    render(<InfiniteScroll {...defaultProps} initialPage={1} />);
    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalledWith(1);
    });
  });

  it('should render loading indicator when loading and infinite scroll enabled', () => {
    render(<InfiniteScroll {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render load more button when infinite scroll is disabled', async () => {
    render(<InfiniteScroll {...defaultProps} />);

    // Open the popover to access settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    // Disable infinite scroll by clicking the switch label
    const switchLabel = screen.getByLabelText(/Enable automatic loading of new/);
    await user.click(switchLabel);

    expect(screen.getByText(/Load.*more/)).toBeInTheDocument();
  });

  it('should call fetchMoreItems when load more button is clicked', async () => {
    jest.clearAllMocks();
    render(<InfiniteScroll {...defaultProps} />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockFetchMoreItems).toHaveBeenCalled();
    });
    jest.clearAllMocks();

    // Open the popover to access settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    // Disable infinite scroll by clicking the switch label
    const switchLabel = screen.getByLabelText(/Enable automatic loading of new/);
    await user.click(switchLabel);

    const loadMoreButton = screen.getByText(/Load.*more/);
    await user.click(loadMoreButton);

    // Should call fetchMoreItems for the next page
    await waitFor(
      () => {
        expect(mockFetchMoreItems).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
  });

  it('should display end of data message when endOfData is true', () => {
    render(<InfiniteScroll {...defaultProps} endOfData={true} />);
    expect(screen.getByText(/All loaded/)).toBeInTheDocument();
  });

  it('should not render load more button when endOfData is true', async () => {
    render(<InfiniteScroll {...defaultProps} endOfData={true} />);

    // Open the popover to access settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    // Disable infinite scroll by clicking the switch label
    const switchLabel = screen.getByLabelText(/Enable automatic loading of new/);
    await user.click(switchLabel);

    expect(screen.queryByText(/Load.*more/)).not.toBeInTheDocument();
  });

  it('should use custom itemsTitle', async () => {
    render(
      <InfiniteScroll
        {...defaultProps}
        itemsTitle="articles"
        text={{ enableAutomaticLoadingOfNew: 'Enable automatic loading of new articles' }}
      />,
    );

    // Open the popover to see settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    // Check for the switch label with custom itemsTitle
    expect(screen.getByText(/Enable automatic loading of new articles/)).toBeInTheDocument();
  });

  it('should render items as articles with correct ARIA attributes', () => {
    render(<InfiniteScroll {...defaultProps} />);
    const articles = screen.getAllByRole('article');

    expect(articles).toHaveLength(3);
    articles.forEach((article, index) => {
      expect(article).toHaveAttribute('aria-posinset', String(index + 1));
      expect(article).toHaveAttribute('tabindex', '0');
    });
  });

  it('should render React nodes as article items', () => {
    const items = [<div key="1">React Node 1</div>, <div key="2">React Node 2</div>];
    render(<InfiniteScroll {...defaultProps} items={items} />);
    expect(screen.getByText('React Node 1')).toBeInTheDocument();
    expect(screen.getByText('React Node 2')).toBeInTheDocument();
  });

  it('should toggle infinite scroll when switch is clicked', async () => {
    render(<InfiniteScroll {...defaultProps} />);

    // Open the popover to access settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();

    // Click the switch label to toggle it off
    const switchLabel = screen.getByLabelText(/Enable automatic loading of new/);
    await user.click(switchLabel);
    expect(switchElement).not.toBeChecked();

    // Click again to toggle it back on
    await user.click(switchLabel);
    expect(switchElement).toBeChecked();
  });

  it('should have correct ARIA label on container when provided', () => {
    render(<InfiniteScroll {...defaultProps} ariaFeedLabel="Custom feed label" />);
    const container = screen.getByLabelText('Custom feed label');
    expect(container).toBeInTheDocument();
  });

  it('should render keyboard shortcuts in settings', async () => {
    render(<InfiniteScroll {...defaultProps} />);

    // Open the popover to see settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    expect(screen.getByText('Keyboard shortcuts:')).toBeInTheDocument();
  });

  it('should handle empty items array', () => {
    render(<InfiniteScroll {...defaultProps} items={[]} />);
    const feed = screen.getByRole('feed');
    expect(feed).toBeInTheDocument();
  });

  it('should use default itemsTitle when not provided', async () => {
    render(<InfiniteScroll {...defaultProps} itemsTitle={undefined} />);

    // Open the popover to see settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    // Check for the switch label with default itemsTitle
    expect(screen.getByText(/Enable automatic loading of new/)).toBeInTheDocument();
  });

  it('should render feedTitle when provided', () => {
    render(<InfiniteScroll {...defaultProps} feedTitle="My Feed" />);
    expect(screen.getByText('My Feed')).toBeInTheDocument();
  });

  it('should use custom feedTitleHeadingLevel', () => {
    const { container } = render(
      <InfiniteScroll {...defaultProps} feedTitle="My Feed" feedTitleHeadingLevel="h1" />,
    );
    const title = container.querySelector('h1');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('My Feed');
  });

  it('should start with infinite scroll disabled when turnOffInfiniteScrollByDefault is true', async () => {
    render(<InfiniteScroll {...defaultProps} turnOffInfiniteScrollByDefault={true} />);

    // Open the popover to access settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should start with infinite scroll disabled when onlyAllowLoadMoreButton is true', async () => {
    render(<InfiniteScroll {...defaultProps} onlyAllowLoadMoreButton={true} />);

    // Load more button should be visible immediately (infinite scroll is disabled)
    await waitFor(() => {
      expect(screen.getByText(/Load.*more/)).toBeInTheDocument();
    });

    // Open the popover to access settings
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);

    // Switch should not be visible when onlyAllowLoadMoreButton is true
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('should toggle popover when settings button is clicked', async () => {
    render(<InfiniteScroll {...defaultProps} />);

    const settingsButton = screen.getByLabelText('Feed settings');

    // Popover should not be visible initially
    expect(screen.queryByText(/Enable automatic loading of new posts/)).not.toBeInTheDocument();

    // Click to open
    await user.click(settingsButton);
    await waitFor(() => {
      expect(screen.getByText(/Enable automatic loading of new/)).toBeInTheDocument();
    });

    // Click again to close
    await user.click(settingsButton);
    // Popover content should be removed from DOM when closed
    await waitFor(
      () => {
        expect(screen.queryByText(/Enable automatic loading of new/)).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should render loading indicator when infinite scroll is disabled', () => {
    render(
      <InfiniteScroll {...defaultProps} turnOffInfiniteScrollByDefault={true} isLoading={true} />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should not render load more button when infinite scroll is enabled', () => {
    render(<InfiniteScroll {...defaultProps} />);
    expect(screen.queryByText(/Load.*more/)).not.toBeInTheDocument();
  });

  it('should handle Escape key to close popover when isInDrawer is true', async () => {
    render(<InfiniteScroll {...defaultProps} isInDrawer={true} />);

    // Open the popover
    const settingsButton = screen.getByLabelText('Feed settings');
    await user.click(settingsButton);
    await waitFor(() => {
      expect(screen.getByText(/Enable automatic loading of new/)).toBeInTheDocument();
    });

    // Press Escape key
    await user.keyboard('{Escape}');

    // Popover should be closed
    await waitFor(
      () => {
        expect(screen.queryByText(/Enable automatic loading of new/)).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
