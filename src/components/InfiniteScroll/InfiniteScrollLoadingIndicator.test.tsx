import { render, screen } from '../../unitTestUtils';
import InfiniteScrollLoadingIndicator from './InfiniteScrollLoadingIndicator';

describe('InfiniteScrollLoadingIndicator', () => {
  it('should not render when isLoading is false', () => {
    const { container } = render(<InfiniteScrollLoadingIndicator isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when isLoading is true', () => {
    render(<InfiniteScrollLoadingIndicator isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('should display "Loading..." when itemsCount is 0', () => {
    render(<InfiniteScrollLoadingIndicator isLoading={true} />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<InfiniteScrollLoadingIndicator isLoading={true} />);
    const statusDiv = screen.getByRole('status');
    expect(statusDiv).toHaveAttribute('aria-live', 'polite');
  });
});
