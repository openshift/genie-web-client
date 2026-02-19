import { render, screen } from '../../unitTestUtils';
import { WidgetArtifactRenderer } from './WidgetArtifactRenderer';
import type { WidgetArtifact, NGUIWidget } from '../../types/chat';

// Mock hooks
jest.mock('../../hooks/useActiveDashboard', () => ({
  useActiveDashboard: () => ({
    addWidgetToDashboard: jest.fn(),
    setActiveDashboard: jest.fn(),
    activeDashboard: null,
    clearActiveDashboard: jest.fn(),
  }),
}));

jest.mock('../../hooks/useDashboards', () => ({
  useDashboards: () => ({
    getDashboardForWidgetId: jest.fn().mockReturnValue(null),
    dashboards: [],
    loaded: true,
    error: null,
  }),
}));

// Mock WidgetRenderer
jest.mock('./WidgetRenderer', () => ({
  WidgetRenderer: ({ widget }: { widget: NGUIWidget }) => (
    <div data-testid="widget-renderer" data-widget-id={widget.id}>
      Widget Renderer
    </div>
  ),
}));

// Mock CanvasCard
jest.mock('../canvas/CanvasCard', () => ({
  CanvasCard: () => <div data-testid="canvas-card">Canvas Card</div>,
}));

const createMockWidgetArtifact = (id: string, title?: string): WidgetArtifact => ({
  id,
  type: 'widget',
  createdAt: new Date(),
  widget: {
    id: `widget-${id}`,
    type: 'ngui',
    spec: { component: 'TestComponent' },
    title,
    createdAt: new Date(),
  } as NGUIWidget,
});

describe('WidgetArtifactRenderer', () => {
  it('renders widget inline with "Add to dashboard" button when not on a dashboard', () => {
    const artifact = createMockWidgetArtifact('test-1', 'Test Widget');

    render(<WidgetArtifactRenderer artifact={artifact} />);

    expect(screen.getByRole('button', { name: /add to dashboard/i })).toBeInTheDocument();
    expect(screen.getByTestId('widget-renderer')).toBeInTheDocument();
    expect(screen.queryByTestId('canvas-card')).not.toBeInTheDocument();
  });
});
