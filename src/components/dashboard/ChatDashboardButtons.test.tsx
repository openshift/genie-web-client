import { render, screen, user, within } from '../../unitTestUtils';
import { ChatDashboardButtons } from './ChatDashboardButtons';

const mockSendStreamMessage = jest.fn();
const mockCreateDashboard = jest.fn().mockResolvedValue({});
const mockSetActiveDashboard = jest.fn();
const mockGetDashboardsForConversation = jest.fn().mockReturnValue([]);
const mockUseActiveConversation = jest.fn().mockReturnValue({ id: 'conv-1' });

jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useActiveConversation: () => mockUseActiveConversation(),
  useSendStreamMessage: () => mockSendStreamMessage,
}));

jest.mock('../../hooks/useDashboardActions', () => ({
  useDashboardActions: () => ({ createDashboard: mockCreateDashboard }),
}));

jest.mock('../../hooks/useActiveDashboard', () => ({
  useActiveDashboard: () => ({
    setActiveDashboard: mockSetActiveDashboard,
  }),
}));

jest.mock('../../hooks/useDashboards', () => ({
  useDashboards: () => ({
    getDashboardsForConversation: mockGetDashboardsForConversation,
    loaded: true,
  }),
}));

describe('ChatDashboardButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActiveConversation.mockReturnValue({ id: 'conv-1' });
    mockGetDashboardsForConversation.mockReturnValue([]);
  });

  it('renders nothing when there is no active conversation id', () => {
    mockUseActiveConversation.mockReturnValue({});
    const { container } = render(<ChatDashboardButtons />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when a dashboard already exists for the conversation', () => {
    mockGetDashboardsForConversation.mockReturnValue([{ id: 'dash-1', spec: {} }] as never[]);
    const { container } = render(<ChatDashboardButtons />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Start with a template and Start from scratch when conversation has no dashboard', () => {
    render(<ChatDashboardButtons />);
    expect(screen.getByText('Start with a template')).toBeInTheDocument();
    expect(screen.getByText('Start from scratch')).toBeInTheDocument();
  });

  it('sends creating-from-scratch message when Start from scratch is clicked', async () => {
    render(<ChatDashboardButtons />);
    const scratchCard = screen
      .getByText('Start from scratch')
      .closest('.pf-v6-c-card') as HTMLElement;
    expect(scratchCard).toBeInTheDocument();
    const startFromScratchButton = within(scratchCard).getByRole('button');
    await user.click(startFromScratchButton);

    await expect(mockCreateDashboard).toHaveBeenCalled();
    expect(mockSetActiveDashboard).toHaveBeenCalled();
    expect(mockSendStreamMessage).toHaveBeenCalledWith('I am creating a dashboard from scratch.');
  });
});
