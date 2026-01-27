import { render, screen, user } from '../../unitTestUtils';

import InfiniteScrollSettings from './InfiniteScrollSettings';

describe('InfiniteScrollSettings', () => {
  const defaultProps = {
    itemsTitle: 'posts',
    isInfiniteScrollEnabled: true,
    onToggleInfiniteScroll: jest.fn(),
  };

  it('should render the settings card with switch', () => {
    render(<InfiniteScrollSettings {...defaultProps} />);
    // The component doesn't render a title, just the switch and keyboard shortcuts
    expect(screen.getByText(/Enable automatic loading of new/)).toBeInTheDocument();
  });

  it('should render keyboard shortcuts component', () => {
    render(<InfiniteScrollSettings {...defaultProps} />);
    expect(screen.getByText('Keyboard shortcuts:')).toBeInTheDocument();
  });

  it('should render the switch component', () => {
    render(<InfiniteScrollSettings {...defaultProps} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('should call onToggleInfiniteScroll when switch is clicked', async () => {
    const onToggle = jest.fn();
    render(<InfiniteScrollSettings {...defaultProps} onToggleInfiniteScroll={onToggle} />);

    const switchElement = screen.getByRole('switch');
    await user.click(switchElement);

    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('should display switch as checked when isInfiniteScrollEnabled is true', () => {
    render(<InfiniteScrollSettings {...defaultProps} isInfiniteScrollEnabled={true} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('should display switch as unchecked when isInfiniteScrollEnabled is false', () => {
    render(<InfiniteScrollSettings {...defaultProps} isInfiniteScrollEnabled={false} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should use itemsTitle in the label', () => {
    render(
      <InfiniteScrollSettings
        {...defaultProps}
        text={{ enableAutomaticLoadingOfNew: 'Enable automatic loading of new articles' }}
      />,
    );
    expect(screen.getByText('Enable automatic loading of new articles')).toBeInTheDocument();
  });

  it('should not render switch when onlyAllowLoadMoreButton is true', () => {
    render(<InfiniteScrollSettings {...defaultProps} onlyAllowLoadMoreButton={true} />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    // Keyboard shortcuts should still be visible
    expect(screen.getByText('Keyboard shortcuts:')).toBeInTheDocument();
  });

  it('should pass isInDrawer prop to KeyboardShortcuts', () => {
    const { container } = render(<InfiniteScrollSettings {...defaultProps} isInDrawer={true} />);
    // When isInDrawer is true, Control+End should not be shown
    // Check that Control+End term is not present in the rendered output
    expect(container.textContent).not.toContain('Control + End');
    // Other shortcuts should still be visible
    expect(screen.getByText('Control + Home')).toBeInTheDocument();
  });
});
