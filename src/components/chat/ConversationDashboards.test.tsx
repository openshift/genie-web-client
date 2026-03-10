import { render, screen, user } from '../../unitTestUtils';
import { ConversationDashboards } from './ConversationDashboards';
import type { AladdinDashboard } from '../../types/dashboard';

// Mock hooks
const mockGetDashboardsForConversation = jest.fn();
const mockSetActiveDashboard = jest.fn();
const mockClearActiveDashboard = jest.fn();
let mockActiveDashboard: AladdinDashboard | null = null;
let mockIsCanvasOpen = false;

jest.mock('../../hooks/useDashboards', () => ({
  useDashboards: () => ({
    getDashboardsForConversation: mockGetDashboardsForConversation,
    loaded: true,
  }),
}));

jest.mock('../../hooks/useActiveDashboard', () => ({
  useActiveDashboard: () => ({
    setActiveDashboard: mockSetActiveDashboard,
    activeDashboard: mockActiveDashboard,
    clearActiveDashboard: mockClearActiveDashboard,
  }),
}));

jest.mock('../../hooks/useChatConversation', () => ({
  useChatConversationContext: () => ({
    isCanvasOpen: mockIsCanvasOpen,
  }),
}));

// Mock CanvasCard to simplify tests
jest.mock('../canvas/CanvasCard', () => ({
  CanvasCard: ({
    title,
    onOpen,
    onClose,
    isViewing,
  }: {
    title: string;
    onOpen: () => void;
    onClose?: () => void;
    isViewing?: boolean;
  }) => (
    <div data-testid="canvas-card">
      <div>{title}</div>
      <button onClick={onOpen}>Open</button>
      {onClose && <button onClick={onClose}>Close</button>}
      {isViewing && <span>Viewing</span>}
    </div>
  ),
}));

const createMockDashboard = (
  name: string,
  title: string,
  creationTimestamp?: string,
): AladdinDashboard => ({
  apiVersion: 'aladdin.openshift.io/v1alpha1',
  kind: 'AladdinDashboard',
  metadata: {
    name,
    namespace: 'default',
    uid: `uid-${name}`,
    creationTimestamp,
  },
  spec: {
    title,
    conversationId: 'conv-1',
    layout: {
      columns: 12,
      panels: [],
    },
  },
});

describe('<ConversationDashboards />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDashboardsForConversation.mockReturnValue([]);
    mockActiveDashboard = null;
    mockIsCanvasOpen = false;
  });

  it('renders nothing when no dashboards exist for conversation', () => {
    mockGetDashboardsForConversation.mockReturnValue([]);

    const { container } = render(
      <ConversationDashboards conversationId="conv-1" shouldDisplay={true} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders CanvasCard with dashboard title', () => {
    const dashboard = createMockDashboard('dash-1', 'My Dashboard');
    mockGetDashboardsForConversation.mockReturnValue([dashboard]);

    render(<ConversationDashboards conversationId="conv-1" shouldDisplay={true} />);

    expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-card')).toBeInTheDocument();
  });

  it('calls setActiveDashboard when onOpen is triggered', async () => {
    const dashboard = createMockDashboard('dash-1', 'Test Dashboard');
    mockGetDashboardsForConversation.mockReturnValue([dashboard]);

    render(<ConversationDashboards conversationId="conv-1" shouldDisplay={true} />);

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(mockSetActiveDashboard).toHaveBeenCalledWith(dashboard);
  });

  it('calls clearActiveDashboard when onClose is triggered', async () => {
    const dashboard = createMockDashboard('dash-1', 'Test Dashboard');
    mockGetDashboardsForConversation.mockReturnValue([dashboard]);

    render(<ConversationDashboards conversationId="conv-1" shouldDisplay={true} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(mockClearActiveDashboard).toHaveBeenCalled();
  });

  it('only displays first dashboard when multiple exist', () => {
    const dashboards = [
      createMockDashboard('dash-1', 'Dashboard One'),
      createMockDashboard('dash-2', 'Dashboard Two'),
    ];
    mockGetDashboardsForConversation.mockReturnValue(dashboards);

    render(<ConversationDashboards conversationId="conv-1" shouldDisplay={true} />);

    expect(screen.getByText('Dashboard One')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Two')).not.toBeInTheDocument();
  });

  it('passes correct conversationId to getDashboardsForConversation', () => {
    render(<ConversationDashboards conversationId="conv-123" shouldDisplay={true} />);

    expect(mockGetDashboardsForConversation).toHaveBeenCalledWith('conv-123');
  });

  it('renders nothing when shouldDisplay is false', () => {
    const dashboard = createMockDashboard('dash-1', 'Test Dashboard');
    mockGetDashboardsForConversation.mockReturnValue([dashboard]);

    const { container } = render(
      <ConversationDashboards conversationId="conv-1" shouldDisplay={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('passes isViewing=true to CanvasCard when canvas is open with matching dashboard', () => {
    const dashboard = createMockDashboard('dash-1', 'Test Dashboard');
    mockGetDashboardsForConversation.mockReturnValue([dashboard]);
    mockActiveDashboard = dashboard;
    mockIsCanvasOpen = true;

    render(<ConversationDashboards conversationId="conv-1" shouldDisplay={true} />);

    expect(screen.getByText('Viewing')).toBeInTheDocument();
  });
});
