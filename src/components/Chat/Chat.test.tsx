import { renderWithoutProviders, screen } from '../../unitTestUtils';
import { Chat } from './Chat';

// Mock useChatConversation hook
const mockUseChatConversation = jest.fn();

jest.mock('../../hooks/useChatConversation', () => ({
  useChatConversation: () => mockUseChatConversation(),
}));

jest.mock('./ChatMessageBar', () => ({
  ChatMessageBar: () => <div data-testid="chat-message-bar">Message Bar</div>,
}));

// Mock MessageList to isolate Chat component testing
jest.mock('./MessageList', () => ({
  MessageList: ({
    isLoading,
    isValidConversationId,
  }: {
    isLoading: boolean;
    isValidConversationId: boolean;
  }) => {
    if (isLoading) {
      return <div data-testid="message-list-loading">Loading conversation</div>;
    }
    if (!isValidConversationId) {
      return (
        <div data-testid="message-list-not-found">
          <div>Conversation not found</div>
          <div>The conversation you are looking for was not found or no longer exists.</div>
          <button>Start a new chat</button>
        </div>
      );
    }
    return <div data-testid="message-list">Messages rendered</div>;
  },
}));

// Mock BadResponseModal to avoid useActiveConversation bug
jest.mock('./feedback/BadResponseModal', () => ({
  BadResponseModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  BadResponseModal: () => null,
}));

const defaultMockValues = {
  conversationId: undefined,
  isLoading: false,
  isValidConversationId: true,
  isCanvasOpen: false,
  activeConversation: undefined,
  conversations: [],
  title: '',
  titleEditState: {
    isEditing: false,
    editValue: '',
    validationError: undefined,
    apiError: null,
    isUpdating: false,
  },
  startEditingTitle: jest.fn(),
  cancelEditingTitle: jest.fn(),
  updateTitleValue: jest.fn(),
  saveTitle: jest.fn(),
  setActiveConversation: jest.fn(),
  createNewConversation: jest.fn(),
  navigateToConversation: jest.fn(),
  canvasState: 'open' as const,
  openCanvas: jest.fn(),
  closeCanvas: jest.fn(),
  maximizeCanvas: jest.fn(),
  setCanvasState: jest.fn(),
  isCreateModeEnabled: false,
  enableCreateMode: jest.fn(),
  disableCreateMode: jest.fn(),
  toggleCreateMode: jest.fn(),
};

describe('Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatConversation.mockReturnValue(defaultMockValues);
  });

  const renderChat = () => {
    return renderWithoutProviders(<Chat />);
  };

  describe('Loading State', () => {
    it('shows loading component when isLoading is true', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        conversationId: 'test-conversation-id',
        isLoading: true,
      });

      renderChat();

      expect(screen.getByText('Loading conversation')).toBeInTheDocument();
    });

    it('does not show loading when isLoading is false', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        conversationId: 'test-conversation-id',
        isLoading: false,
      });

      renderChat();

      expect(screen.queryByText('Loading conversation')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows ConversationNotFound when isValidConversationId is false', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        conversationId: 'invalid-conversation-id',
        isValidConversationId: false,
      });

      renderChat();

      expect(screen.getByText('Conversation not found')).toBeInTheDocument();
    });

    it('shows error message and button in ConversationNotFound', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        conversationId: 'invalid-conversation-id',
        isValidConversationId: false,
      });

      renderChat();

      expect(screen.getByText('Conversation not found')).toBeInTheDocument();
      expect(
        screen.getByText('The conversation you are looking for was not found or no longer exists.'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start a new chat' })).toBeInTheDocument();
    });
  });

  describe('MessageList Integration', () => {
    it('passes isLoading to MessageList during loading', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        conversationId: 'test-conversation-id',
        isLoading: true,
      });

      renderChat();

      expect(screen.getByTestId('message-list-loading')).toBeInTheDocument();
    });

    it('passes isValidConversationId=false to MessageList when conversation not found', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        conversationId: 'invalid-conversation-id',
        isValidConversationId: false,
      });

      renderChat();

      expect(screen.getByTestId('message-list-not-found')).toBeInTheDocument();
    });

    it('renders MessageList when conversation is valid', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        conversationId: 'test-conversation-id',
        isValidConversationId: true,
      });

      renderChat();

      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });
  });

  describe('No Conversation ID', () => {
    it('renders MessageList without conversationId', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        conversationId: undefined,
      });

      renderChat();

      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });
  });

  describe('Canvas State', () => {
    it('applies canvas-open class when isCanvasOpen is true', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        isCanvasOpen: true,
      });

      const { container } = renderChat();

      expect(container.querySelector('.chat--canvas-open')).toBeInTheDocument();
    });

    it('does not apply canvas-open class when isCanvasOpen is false', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        isCanvasOpen: false,
      });

      const { container } = renderChat();

      expect(container.querySelector('.chat--canvas-open')).not.toBeInTheDocument();
    });
  });
});
