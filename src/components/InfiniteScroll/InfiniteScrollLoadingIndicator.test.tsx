import { render, screen } from '../../unitTestUtils';
import InfiniteScrollLoadingIndicator from './InfiniteScrollLoadingIndicator';

describe('InfiniteScrollLoadingIndicator', () => {
  it('should not render when isLoading is false', () => {
    const { container } = render(
      <InfiniteScrollLoadingIndicator isLoading={false} itemsCount={0} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isLoading is true', () => {
    render(<InfiniteScrollLoadingIndicator isLoading={true} itemsCount={0} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('should display "Loading..." when itemsCount is 0', () => {
    render(<InfiniteScrollLoadingIndicator isLoading={true} itemsCount={0} />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('should display "Loading X more..." when itemsCount > 0 and itemsPerPage is provided', () => {
    render(<InfiniteScrollLoadingIndicator isLoading={true} itemsCount={10} itemsPerPage={5} />);
    // The component renders "Loading  5 more  ..." with spaces, so we use a flexible regex
    expect(screen.getByText(/Loading\s+5\s+more/)).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<InfiniteScrollLoadingIndicator isLoading={true} itemsCount={0} />);
    const statusDiv = screen.getByRole('status');
    expect(statusDiv).toHaveAttribute('aria-live', 'polite');
  });
});
