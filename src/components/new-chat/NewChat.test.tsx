import { render, screen, user } from '../../unitTestUtils';
import { NewChat } from './NewChat';

// Mocks
const mockSendStreamMessage = jest.fn();
const mockInjectBotMessage = jest.fn();
const mockCreateNewConversation = jest.fn().mockResolvedValue(undefined);
const mockUseNavigate = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useSendStreamMessage: () => mockSendStreamMessage,
  useInjectBotMessage: () => mockInjectBotMessage,
  useCreateNewConversation: () => mockCreateNewConversation,
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockUseNavigate,
}));

describe('NewChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderNewChat = () => render(<NewChat />);

  it('does not create a conversation on mount', () => {
    renderNewChat();
    expect(mockCreateNewConversation).not.toHaveBeenCalled();
  });

  it('renders heading, description and suggestion buttons', async () => {
    renderNewChat();

    // Heading/description come from i18n; verify description exists
    expect(
      screen.getByText(
        'Genie can help you explore, build, and troubleshoot OpenShift — all in one place.',
      ),
    ).toBeInTheDocument();

    // Suggestion buttons (labels from i18n)
    expect(screen.getByRole('button', { name: 'Build / Configure' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Automate Tasks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Troubleshoot / Diagnose' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze / Optimize' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Explore what's possible" })).toBeInTheDocument();
  });

  it('injects bot message with quick responses when a suggestion is clicked', async () => {
    renderNewChat();

    const buildButton = screen.getByRole('button', { name: 'Build / Configure' });
    await user.click(buildButton);

    expect(mockCreateNewConversation).toHaveBeenCalled();
    expect(mockInjectBotMessage).toHaveBeenCalled();
    const [options] = mockInjectBotMessage.mock.calls[0];

    // Answer is the intro message resolved from i18n
    expect(typeof options.answer).toBe('string');
    expect(options.answer.length).toBeGreaterThan(0);

    // additionalAttributes includes quick responses payload
    const qr = options.additionalAttributes?.quickResponses;
    expect(qr?.key).toBe('build');
    expect(Array.isArray(qr?.items)).toBe(true);
    expect(qr?.items?.length).toBe(4);

    // Navigates to Chat
    expect(mockUseNavigate).toHaveBeenCalled();
  });
});
