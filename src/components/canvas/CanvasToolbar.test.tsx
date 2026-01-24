import { render, screen, fireEvent, checkAccessibility } from '../../unitTestUtils';
import { CanvasToolbar, ArtifactOption } from './CanvasToolbar';

const mockResizeObserver = (width: number) => {
  class ResizeObserverMock {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe() {
      this.callback([{ contentRect: { width } } as ResizeObserverEntry], this);
    }
    disconnect() {
      // no-op for test mock
    }
    unobserve() {
      // no-op for test mock
    }
  }
  global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
};

describe('CanvasToolbar', () => {
  const mockOnAction = jest.fn();
  const mockOnTitleChange = jest.fn();
  const mockOnArtifactSelect = jest.fn();

  const artifacts: ArtifactOption[] = [
    { id: '1', name: 'Artifact One' },
    { id: '2', name: 'Artifact Two' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockResizeObserver(1200);
  });

  it('renders left slot with toggle and artifact switcher dropdown', () => {
    render(
      <CanvasToolbar
        title="Artifact One"
        onTitleChange={mockOnTitleChange}
        onAction={mockOnAction}
        artifacts={artifacts}
        selectedArtifactId="1"
        onArtifactSelect={mockOnArtifactSelect}
      />,
    );

    expect(screen.getByLabelText('Collapse canvas')).toBeInTheDocument();
    expect(screen.getByText('Artifact One')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch artifact')).toBeInTheDocument();
  });

  it('renders title button when no artifacts provided', () => {
    render(
      <CanvasToolbar
        title="Test Title"
        onTitleChange={mockOnTitleChange}
        onAction={mockOnAction}
      />,
    );

    expect(screen.getByLabelText('Edit canvas title')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction for center actions', async () => {
    render(<CanvasToolbar title="Test Title" onAction={mockOnAction} />);

    fireEvent.click(screen.getByLabelText('Undo'));
    fireEvent.click(screen.getByLabelText('Redo'));

    // Open time range dropdown and select an option
    fireEvent.click(screen.getByLabelText('Select time range'));
    const timeOption = await screen.findByText('Last 15 min');
    fireEvent.click(timeOption);

    // Open refresh interval dropdown and select an option
    fireEvent.click(screen.getByLabelText('Select refresh interval'));
    const intervalOption = await screen.findByText('30 sec');
    fireEvent.click(intervalOption);

    fireEvent.click(screen.getByLabelText('Refresh'));

    expect(mockOnAction).toHaveBeenCalledWith('UNDO');
    expect(mockOnAction).toHaveBeenCalledWith('REDO');
    expect(mockOnAction).toHaveBeenCalledWith('TIME_RANGE_CHANGE');
    expect(mockOnAction).toHaveBeenCalledWith('REFRESH_INTERVAL_CHANGE');
    expect(mockOnAction).toHaveBeenCalledWith('REFRESH');
  });

  it('calls onAction for toggle and close', () => {
    render(<CanvasToolbar title="Test Title" onAction={mockOnAction} />);

    fireEvent.click(screen.getByLabelText('Collapse canvas'));
    fireEvent.click(screen.getByLabelText('Close'));

    expect(mockOnAction).toHaveBeenCalledWith('TOGGLE_CANVAS');
    expect(mockOnAction).toHaveBeenCalledWith('CLOSE');
  });

  it('opens artifact switcher and selects artifact', () => {
    render(
      <CanvasToolbar
        title="Test Title"
        onAction={mockOnAction}
        artifacts={artifacts}
        selectedArtifactId="1"
        onArtifactSelect={mockOnArtifactSelect}
      />,
    );

    fireEvent.click(screen.getByLabelText('Switch artifact'));
    fireEvent.click(screen.getByText('Artifact Two'));

    expect(mockOnArtifactSelect).toHaveBeenCalledWith('2');
  });

  it('collapses center actions into overflow at narrow width', () => {
    mockResizeObserver(600);
    render(<CanvasToolbar title="Test Title" onAction={mockOnAction} />);

    expect(screen.queryByLabelText('Undo')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Select time range')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('More options'));
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
  });

  it('renders CatalogIcon before title', () => {
    render(<CanvasToolbar title="Test Title" onAction={mockOnAction} />);

    const iconContainer = document.querySelector('.canvas-toolbar__title-icon');
    expect(iconContainer).toBeInTheDocument();
    const svgIcon = iconContainer?.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CanvasToolbar title="Test Title" onAction={mockOnAction} />);
    await checkAccessibility(container);
  });
});
