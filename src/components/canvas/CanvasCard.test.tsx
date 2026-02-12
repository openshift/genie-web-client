import {
  renderWithoutProviders as render,
  screen,
  user,
  checkAccessibility,
} from '../../unitTestUtils';
import { CanvasCard } from './CanvasCard';
import type { CanvasCardProps } from './CanvasCard';

describe('<CanvasCard />', () => {
  const baseProps: CanvasCardProps = {
    artifactId: 'artifact-123',
    title: 'New Monitoring Dashboard',
    type: 'dashboard' as const,
    lastModified: new Date('2024-06-06T14:28:00Z'),
    onOpen: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays title and metadata when not viewing', () => {
    render(<CanvasCard {...baseProps} />);

    expect(screen.getByText('New Monitoring Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open canvas for/i })).toBeInTheDocument();

    // check that metadata section exists and contains type info
    const metadataSection = document.querySelector('.canvas-card__metadata');
    expect(metadataSection).toBeInTheDocument();
    expect(metadataSection?.textContent).toContain('Dashboard');
  });

  it('calls onOpen when the card is clicked', async () => {
    render(<CanvasCard {...baseProps} />);

    await user.click(screen.getByRole('button', { name: /open canvas for/i }));

    expect(baseProps.onOpen).toHaveBeenCalledWith('artifact-123');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CanvasCard {...baseProps} />);
    await checkAccessibility(container);
  });
});
