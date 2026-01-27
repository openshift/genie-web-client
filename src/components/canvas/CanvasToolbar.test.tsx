import { render, screen, checkAccessibility } from '../../unitTestUtils';
import { CanvasToolbar } from './CanvasToolbar';

describe('CanvasToolbar', () => {
  it('renders left slot content when provided', () => {
    render(<CanvasToolbar left={<span data-testid="left">Left content</span>} />);
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByText('Left content')).toBeInTheDocument();
  });

  it('renders center slot content when provided', () => {
    render(<CanvasToolbar center={<span data-testid="center">Center content</span>} />);
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByText('Center content')).toBeInTheDocument();
  });

  it('renders right slot content when provided', () => {
    render(<CanvasToolbar right={<span data-testid="right">Right content</span>} />);
    expect(screen.getByTestId('right')).toBeInTheDocument();
    expect(screen.getByText('Right content')).toBeInTheDocument();
  });

  it('renders all three slots when provided', () => {
    render(
      <CanvasToolbar
        left={<span data-testid="left">Left</span>}
        center={<span data-testid="center">Center</span>}
        right={<span data-testid="right">Right</span>}
      />,
    );
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('applies custom className to the toolbar', () => {
    const { container } = render(
      <CanvasToolbar className="custom-toolbar" left={<span>Left</span>} />,
    );
    const toolbar = container.querySelector('.canvas-toolbar.custom-toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('renders toolbar wrapper and slots when all props are optional', () => {
    const { container } = render(<CanvasToolbar />);
    expect(container.querySelector('.canvas-toolbar__wrapper')).toBeInTheDocument();
    expect(container.querySelector('.canvas-toolbar')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CanvasToolbar
        left={<span>Left</span>}
        center={<span>Center</span>}
        right={<span>Right</span>}
      />,
    );
    await checkAccessibility(container);
  });
});
