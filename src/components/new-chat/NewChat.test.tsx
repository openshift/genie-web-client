import { render, screen, user } from '../../unitTestUtils';
import { NewChat } from './NewChat';

// Mocks
const mockUseSendMessage = jest.fn();
const mockUseNavigate = jest.fn();

jest.mock('@redhat-cloud-services/ai-react-state', () => ({
  ...jest.requireActual('@redhat-cloud-services/ai-react-state'),
  useSendMessage: () => mockUseSendMessage,
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockUseNavigate,
}));

describe('NewChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSendMessage.mockResolvedValue(undefined);
  });

  const renderNewChat = () => render(<NewChat />);

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

  it('sends message with quick responses payload when a suggestion is clicked', async () => {
    renderNewChat();

    const buildButton = screen.getByRole('button', { name: 'Build / Configure' });
    await user.click(buildButton);

    expect(mockUseSendMessage).toHaveBeenCalled();
    const [prompt, options] = mockUseSendMessage.mock.calls[0];

    // Prompt resolved from i18n intro key
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);

    // Options include stream and quick responses payload
    expect(options?.stream).toBe(true);
    const qr = options?.requestPayload?.quickResponses;
    expect(qr?.key).toBe('build');
    expect(Array.isArray(qr?.items)).toBe(true);
    expect(qr?.items?.length).toBe(4);

    // Navigates to Chat
    expect(mockUseNavigate).toHaveBeenCalled();
  });
});
