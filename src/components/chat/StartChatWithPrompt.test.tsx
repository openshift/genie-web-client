import { render, screen } from '../../unitTestUtils';
import { StartChatWithPrompt } from './StartChatWithPrompt';
import { mainGenieRoute, SubRoutes, START_CHAT_PROMPT_PARAM } from '../routeList';

const mockCreateNewConversation = jest.fn().mockResolvedValue(undefined);
const mockSendStreamMessage = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useCreateNewConversation: () => mockCreateNewConversation,
  useSendStreamMessage: () => mockSendStreamMessage,
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
}));

const startChatPath = `${mainGenieRoute}/${SubRoutes.Chat}/start`;

describe('StartChatWithPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders spinner with accessible label when prompt param is present', () => {
    render(<StartChatWithPrompt />, {
      initialEntries: [`${startChatPath}?${START_CHAT_PROMPT_PARAM}=Test%20prompt`],
    });
    expect(screen.getByRole('progressbar', { name: 'Starting chat' })).toBeInTheDocument();
  });

  it('navigates to chat when prompt param is missing', () => {
    render(<StartChatWithPrompt />, { initialEntries: [startChatPath] });
    expect(mockNavigate).toHaveBeenCalledWith(`${mainGenieRoute}/${SubRoutes.Chat}`, {
      replace: true,
    });
    expect(mockCreateNewConversation).not.toHaveBeenCalled();
    expect(mockSendStreamMessage).not.toHaveBeenCalled();
  });

  it('creates conversation, sends prompt, then navigates to chat when prompt param is present', async () => {
    const prompt = 'Can you help me create a new dashboard?';
    render(<StartChatWithPrompt />, {
      initialEntries: [`${startChatPath}?${START_CHAT_PROMPT_PARAM}=${encodeURIComponent(prompt)}`],
    });

    await jest.runAllTimersAsync();

    expect(mockCreateNewConversation).toHaveBeenCalled();
    expect(mockSendStreamMessage).toHaveBeenCalledWith(prompt);
    expect(mockNavigate).toHaveBeenCalledWith(`${mainGenieRoute}/${SubRoutes.Chat}`);
  });
});
