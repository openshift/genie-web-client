import { render, screen, user } from '../../unitTestUtils';
import { LayoutMessageBar } from './LayoutMessageBar';

// Mocks
const mockSendStreamMessage = jest.fn();
const mockCreateNewConversation = jest.fn().mockResolvedValue(undefined);
const mockNavigate = jest.fn();
const mockUseActiveConversation = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useSendStreamMessage: () => mockSendStreamMessage,
  useCreateNewConversation: () => mockCreateNewConversation,
  useActiveConversation: () => mockUseActiveConversation(),
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
}));

describe('<LayoutMessageBar />', () => {
  const mockRef = { current: null } as React.RefObject<HTMLTextAreaElement>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMessageBar = () => render(<LayoutMessageBar messageBarRef={mockRef} />);

  it('creates a new conversation when there is no active conversation', async () => {
    // Arrange
    mockUseActiveConversation.mockReturnValue(null);
    renderMessageBar();
    const messageInput = screen.getByRole('textbox', { name: 'Send a message...' });
    expect(messageInput).toBeInTheDocument();

    // Act
    await user.type(messageInput, 'Hello, what is OpenShift?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    // Assert
    expect(mockCreateNewConversation).toHaveBeenCalledTimes(1);
    expect(mockSendStreamMessage).toHaveBeenCalledWith('Hello, what is OpenShift?');
    expect(mockNavigate).toHaveBeenCalledWith('/genie/chat');
  });

  it('does not create a new conversation when there is an active conversation', async () => {
    // Arrange
    const activeConversation = { id: 'conv-123', messages: [] };
    mockUseActiveConversation.mockReturnValue(activeConversation);
    renderMessageBar();
    const messageInput = screen.getByRole('textbox', { name: 'Send a message...' });

    // Act
    await user.type(messageInput, 'Tell me more about pods');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockCreateNewConversation).not.toHaveBeenCalled();
    expect(mockSendStreamMessage).toHaveBeenCalledWith('Tell me more about pods');
    expect(mockNavigate).toHaveBeenCalledWith('/genie/chat');
  });

  it('sends message and navigates when active conversation exists', async () => {
    // Arrange
    const activeConversation = { id: 'conv-456', messages: [{ role: 'user', answer: 'previous' }] };
    mockUseActiveConversation.mockReturnValue(activeConversation);
    renderMessageBar();
    const messageInput = screen.getByRole('textbox', { name: 'Send a message...' });

    // Act
    await user.type(messageInput, 'Follow-up question');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    // Assert
    expect(mockCreateNewConversation).not.toHaveBeenCalled();
    expect(mockSendStreamMessage).toHaveBeenCalledTimes(1);
    expect(mockSendStreamMessage).toHaveBeenCalledWith('Follow-up question');
    expect(mockNavigate).toHaveBeenCalledWith('/genie/chat');
  });

  it('sends message and navigates when no active conversation exists', async () => {
    // Arrange
    mockUseActiveConversation.mockReturnValue(null);
    renderMessageBar();
    const messageInput = screen.getByRole('textbox', { name: 'Send a message...' });

    // Act
    await user.type(messageInput, 'Start new conversation');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    // Assert
    expect(mockCreateNewConversation).toHaveBeenCalledTimes(1);
    expect(mockSendStreamMessage).toHaveBeenCalledTimes(1);
    expect(mockSendStreamMessage).toHaveBeenCalledWith('Start new conversation');
    expect(mockNavigate).toHaveBeenCalledWith('/genie/chat');
  });
});
