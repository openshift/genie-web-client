import { render, screen, checkAccessibility } from '../../unitTestUtils';
import { CanvasLayout } from './CanvasLayout';

describe('CanvasLayout', () => {
  const defaultProps = {
    toolbar: <div data-testid="toolbar-content">Toolbar Content</div>,
    footer: <div data-testid="footer-content">Footer Content</div>,
    children: <div data-testid="main-content">Main Content</div>,
  };

  it('renders toolbar, content, and footer sections', () => {
    render(<CanvasLayout {...defaultProps} />);

    expect(screen.getByTestId('toolbar-content')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
  });

  it('renders toolbar before content and content before footer in DOM order', () => {
    render(<CanvasLayout {...defaultProps} />);

    const toolbar = screen.getByTestId('toolbar-content');
    const content = screen.getByTestId('main-content');
    const footer = screen.getByTestId('footer-content');

    // Check DOM order using compareDocumentPosition
    expect(
      toolbar.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('applies correct CSS classes to layout sections', () => {
    const { container } = render(<CanvasLayout {...defaultProps} />);

    expect(container.querySelector('.canvas-layout')).toBeInTheDocument();
    expect(container.querySelector('.canvas-layout__toolbar')).toBeInTheDocument();
    expect(container.querySelector('.canvas-layout__content')).toBeInTheDocument();
    expect(container.querySelector('.canvas-layout__footer')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CanvasLayout {...defaultProps} />);

    await checkAccessibility(container);
  });
});
