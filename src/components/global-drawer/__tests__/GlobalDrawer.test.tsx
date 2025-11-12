import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalDrawer } from '../GlobalDrawer';

describe('GlobalDrawer', () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    heading: 'Test Drawer',
    icon: <span data-testid="test-icon">🔧</span>,
    children: <div>Test drawer content</div>,
    position: 'right' as const,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <GlobalDrawer {...defaultProps} isOpen={false} />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Test Drawer')).not.toBeInTheDocument();
  });

  it('renders drawer with all content when isOpen is true', () => {
    render(<GlobalDrawer {...defaultProps} />);

    expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test drawer content')).toBeInTheDocument();
  });

  it('renders heading and icon in the drawer head', () => {
    render(<GlobalDrawer {...defaultProps} />);

    const heading = screen.getByText('Test Drawer');
    const icon = screen.getByTestId('test-icon');

    expect(heading).toBeInTheDocument();
    expect(icon).toBeInTheDocument();

    // Check they are in the same container
    const headingContainer = heading.closest('.global-drawer-heading');
    expect(headingContainer).toContainElement(icon);
  });

  it('triggers onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<GlobalDrawer {...defaultProps} />);

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<GlobalDrawer {...defaultProps} />);

    // Find the backdrop (it's the outermost div with onClick)
    const backdrop = container.querySelector('.pf-v6-c-backdrop, .pf-c-backdrop');
    
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    } else {
      // Fallback: test by finding the first clickable parent element
      const drawerElement = screen.getByText('Test Drawer').closest('div[class*="drawer"]');
      if (drawerElement?.parentElement) {
        await user.click(drawerElement.parentElement);
        expect(mockOnClose).toHaveBeenCalled();
      }
    }
  });

  it('renders with left position', () => {
    render(<GlobalDrawer {...defaultProps} position="left" />);

    expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    expect(screen.getByText('Test drawer content')).toBeInTheDocument();
  });

  it('renders with right position', () => {
    render(<GlobalDrawer {...defaultProps} position="right" />);

    expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    expect(screen.getByText('Test drawer content')).toBeInTheDocument();
  });

  it('renders children content in drawer body', () => {
    render(
      <GlobalDrawer
        {...defaultProps}
        children={
          <div>
            <p>First paragraph</p>
            <p>Second paragraph</p>
            <button>Action Button</button>
          </div>
        }
      />
    );

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('renders complex heading content', () => {
    render(
      <GlobalDrawer
        {...defaultProps}
        heading={
          <div>
            <strong>Bold Title</strong>
            <span> with extra text</span>
          </div>
        }
      />
    );

    expect(screen.getByText('Bold Title')).toBeInTheDocument();
    expect(screen.getByText('with extra text')).toBeInTheDocument();
  });

  it('renders complex icon content', () => {
    render(
      <GlobalDrawer
        {...defaultProps}
        icon={
          <div data-testid="complex-icon">
            <span>Icon</span>
            <span>Badge</span>
          </div>
        }
      />
    );

    const complexIcon = screen.getByTestId('complex-icon');
    expect(complexIcon).toBeInTheDocument();
    expect(complexIcon).toHaveTextContent('IconBadge');
  });

  it('does not close drawer when clicking inside drawer panel', async () => {
    const user = userEvent.setup();
    render(<GlobalDrawer {...defaultProps} />);

    // Click on drawer content
    const content = screen.getByText('Test drawer content');
    await user.click(content);

    // onClose should not be called because stopPropagation prevents it
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('has proper structure with PatternFly components', () => {
    const { container } = render(<GlobalDrawer {...defaultProps} />);

    // Check for PatternFly drawer structure
    expect(container.querySelector('.pf-v6-c-drawer, .pf-c-drawer')).toBeInTheDocument();
  });

  it('displays close button with accessible label', () => {
    render(<GlobalDrawer {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('transitions from closed to open state', () => {
    const { rerender } = render(
      <GlobalDrawer {...defaultProps} isOpen={false} />
    );

    expect(screen.queryByText('Test Drawer')).not.toBeInTheDocument();

    rerender(<GlobalDrawer {...defaultProps} isOpen={true} />);

    expect(screen.getByText('Test Drawer')).toBeInTheDocument();
  });

  it('transitions from open to closed state', () => {
    const { rerender } = render(<GlobalDrawer {...defaultProps} isOpen={true} />);

    expect(screen.getByText('Test Drawer')).toBeInTheDocument();

    rerender(<GlobalDrawer {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Drawer')).not.toBeInTheDocument();
  });
});

