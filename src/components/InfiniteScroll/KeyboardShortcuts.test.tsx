import { render, screen } from '../../unitTestUtils';
import KeyboardShortcuts from './KeyboardShortcuts';

describe('KeyboardShortcuts', () => {
  it('should render the keyboard shortcuts title', () => {
    render(<KeyboardShortcuts />);
    expect(screen.getByText('Keyboard shortcuts:')).toBeInTheDocument();
  });

  it('should render all keyboard shortcuts', () => {
    render(<KeyboardShortcuts />);

    expect(screen.getByText('Escape')).toBeInTheDocument();
    expect(screen.getByText('Exit list')).toBeInTheDocument();

    expect(screen.getByText('Page Down')).toBeInTheDocument();
    expect(screen.getByText('Move focus to next item')).toBeInTheDocument();

    expect(screen.getByText('Page Up')).toBeInTheDocument();
    expect(screen.getByText('Move focus to previous item')).toBeInTheDocument();

    expect(screen.getByText('Control + Home')).toBeInTheDocument();
    expect(
      screen.getByText('Move focus to first focusable element in the feed'),
    ).toBeInTheDocument();

    expect(screen.getByText('Control + End')).toBeInTheDocument();
    expect(
      screen.getByText('Move focus to first focusable element after the feed'),
    ).toBeInTheDocument();
  });

  it('should hide Control+End when isInDrawer is true', () => {
    render(<KeyboardShortcuts isInDrawer={true} />);
    expect(screen.queryByText('Control + End')).not.toBeInTheDocument();
    // Other shortcuts should still be visible
    expect(screen.getByText('Control + Home')).toBeInTheDocument();
    expect(screen.getByText('Escape')).toBeInTheDocument();
  });

  it('should show Control+End when isInDrawer is false', () => {
    render(<KeyboardShortcuts isInDrawer={false} />);
    expect(screen.getByText('Control + End')).toBeInTheDocument();
  });
});
