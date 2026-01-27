import { renderWithoutProviders, screen, waitFor } from '../../unitTestUtils';
import { Chat } from './Chat';
import { ChatBarProvider, useChatBar } from '../ChatBarContext';

// Mock the hooks
const mockUseMessages = jest.fn();
const mockUseSetActiveConversation = jest.fn();
const mockUseSendMessage = jest.fn();
const mockUseSendStreamMessage = jest.fn();
const mockUseStreamChunk = jest.fn();
const mockUseInProgress = jest.fn();
const mockUseActiveConversation = jest.fn();
const mockUseParams = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  useMessages: () => mockUseMessages(),
  useSendMessage: () => mockUseSendMessage(),
  useSetActiveConversation: () => mockUseSetActiveConversation(),
  useSendStreamMessage: () => mockUseSendStreamMessage(),
  useStreamChunk: () => mockUseStreamChunk(),
  useInProgress: () => mockUseInProgress(),
  useActiveConversation: () => mockUseActiveConversation(),
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
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

describe('Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMessages.mockReturnValue([]);
    mockUseSetActiveConversation.mockReturnValue(jest.fn().mockResolvedValue(undefined));
    mockUseSendStreamMessage.mockReturnValue(jest.fn());
    mockUseStreamChunk.mockReturnValue(undefined);
    mockUseInProgress.mockReturnValue(false);
    mockUseActiveConversation.mockReturnValue(null);
    mockUseParams.mockReturnValue({});
    mockNavigate.mockClear();
  });

  const renderChat = () => {
    // NOTE:  This may cause a "Warning: React does not recognize the `isPrimary` prop on a DOM element" warning when running tests
    // This is due to a bug in PatternFly' Message component that incorrect passes the prop down to the HTML
    return renderWithoutProviders(
      <ChatBarProvider>
        <Chat />
      </ChatBarProvider>,
    );
  };

  describe('Loading State', () => {
    it('shows loading component when conversationId is present and messages are empty', async () => {
      let resolvePromise: (() => void) | undefined;
      const mockSetActiveConversation = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            // Store resolve function to control when promise resolves
            resolvePromise = resolve;
          }),
      );
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      // Wait for loading state to appear
      await waitFor(() => {
        expect(screen.getByText('Loading conversation')).toBeInTheDocument();
      });

      // Resolve the promise to clean up
      if (resolvePromise) {
        await waitFor(() => resolvePromise?.());
      }
    });

    it('calls setActiveConversation with conversationId from URL params', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-123' });

      renderChat();

      await waitFor(() => {
        expect(mockSetActiveConversation).toHaveBeenCalledWith('test-conversation-123');
      });
    });

    it('does not show loading when messages exist', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          message: 'Hello',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(mockSetActiveConversation).toHaveBeenCalled();
      });

      // Loading should not be shown when messages exist
      expect(screen.queryByText('Loading conversation')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows ConversationNotFound when setActiveConversation throws an error', async () => {
      const mockSetActiveConversation = jest.fn().mockRejectedValue(new Error('Not found'));
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'invalid-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('Conversation not found')).toBeInTheDocument();
      });
    });

    it('shows error message and button in ConversationNotFound', async () => {
      const mockSetActiveConversation = jest.fn().mockRejectedValue(new Error('Not found'));
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'invalid-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('Conversation not found')).toBeInTheDocument();
        expect(
          screen.getByText(
            'The conversation you are looking for was not found or no longer exists.',
          ),
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start a new chat' })).toBeInTheDocument();
      });
    });
  });

  describe('MessageList Integration', () => {
    it('passes isLoading to MessageList during async operation', async () => {
      let resolvePromise: (() => void) | undefined;
      const mockSetActiveConversation = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolvePromise = resolve;
          }),
      );
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      // MessageList should show loading state
      await waitFor(() => {
        expect(screen.getByTestId('message-list-loading')).toBeInTheDocument();
      });

      // Resolve the promise to clean up
      if (resolvePromise) {
        await waitFor(() => resolvePromise?.());
      }
    });

    it('passes isValidConversationId=false to MessageList when conversation not found', async () => {
      const mockSetActiveConversation = jest.fn().mockRejectedValue(new Error('Not found'));
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'invalid-conversation-id' });

      renderChat();

      // MessageList should show not found state
      await waitFor(() => {
        expect(screen.getByTestId('message-list-not-found')).toBeInTheDocument();
      });
    });

    it('renders MessageList when conversation is valid', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByTestId('message-list')).toBeInTheDocument();
      });
    });
  });

  describe('Chat Bar Visibility', () => {
    it('sets chat bar visibility to true when conversation is valid', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'valid-conversation-id' });

      // Create a test component that uses the ChatBarContext to verify visibility
      const TestComponent = () => {
        const { showChatBar } = useChatBar();
        return <div data-testid="chat-bar-visibility">{String(showChatBar)}</div>;
      };

      renderWithoutProviders(
        <ChatBarProvider>
          <TestComponent />
          <Chat />
        </ChatBarProvider>,
      );

      // Wait for the async operation to complete and the effect to update visibility
      // The Chat component's isValidConversationId starts as true, so setShowChatBar(true)
      // should be called initially, then again after the async operation succeeds
      await waitFor(
        () => {
          expect(mockSetActiveConversation).toHaveBeenCalled();
          // NOTE: getByTestId is used because the TestComponent renders visibility as text content
          // in a data-testid element, and we need to verify the boolean value as a string
          const visibilityElement = screen.getByTestId('chat-bar-visibility');
          expect(visibilityElement.textContent).toBe('true');
        },
        { timeout: 3000 },
      );
    });

    it('sets chat bar visibility to false when conversation is invalid', async () => {
      const mockSetActiveConversation = jest.fn().mockRejectedValue(new Error('Not found'));
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({ conversationId: 'invalid-conversation-id' });

      // Create a test component that uses the ChatBarContext to verify visibility
      const TestComponent = () => {
        const { showChatBar } = useChatBar();
        return <div data-testid="chat-bar-visibility">{String(showChatBar)}</div>;
      };

      renderWithoutProviders(
        <ChatBarProvider>
          <TestComponent />
          <Chat />
        </ChatBarProvider>,
      );

      // Wait for the async operation to reject, error to be caught, and visibility updated
      // The Chat component's isValidConversationId starts as true, so initially setShowChatBar(true)
      // is called, but after the error, isValidConversationId becomes false and setShowChatBar(false) is called
      await waitFor(
        () => {
          expect(mockSetActiveConversation).toHaveBeenCalled();
          // NOTE: getByTestId is used because the TestComponent renders visibility as text content
          // in a data-testid element, and we need to verify the boolean value as a string
          const visibilityElement = screen.getByTestId('chat-bar-visibility');
          expect(visibilityElement.textContent).toBe('false');
        },
        { timeout: 3000 },
      );
    });
  });

  describe('No Conversation ID', () => {
    it('does not call setActiveConversation when conversationId is undefined', () => {
      const mockSetActiveConversation = jest.fn();
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({});

      renderChat();

      expect(mockSetActiveConversation).not.toHaveBeenCalled();
    });

    it('renders MessageList without conversationId', () => {
      mockUseMessages.mockReturnValue([]);
      mockUseParams.mockReturnValue({});

      renderChat();

      // MessageList should render since isValidConversationId defaults to true
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });
  });

  describe('URL Update with ConversationId', () => {
    it('updates URL with conversationId when new conversation starts and URL has no conversationId', async () => {
      mockUseParams.mockReturnValue({});
      mockUseActiveConversation.mockReturnValue({
        id: 'new-conversation-123',
        messages: [],
      });

      renderChat();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/genie/chat/new-conversation-123', {
          replace: true,
        });
      });
    });

    it('does not update URL when conversationId is already in URL', () => {
      mockUseParams.mockReturnValue({ conversationId: 'existing-conversation-123' });
      mockUseActiveConversation.mockReturnValue({
        id: 'existing-conversation-123',
        messages: [],
      });

      renderChat();

      // Navigate should not be called when conversationId is already in URL
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not update URL when active conversation has temporary ID', async () => {
      mockUseParams.mockReturnValue({});
      mockUseActiveConversation.mockReturnValue({
        id: 'conversation__temp123',
        messages: [],
      });

      renderChat();

      // Wait a bit to ensure the effect doesn't trigger
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate should not be called for temporary conversation IDs
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not update URL when there is no active conversation', () => {
      mockUseParams.mockReturnValue({});
      mockUseActiveConversation.mockReturnValue(null);

      renderChat();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not update URL when active conversation has no ID', () => {
      mockUseParams.mockReturnValue({});
      mockUseActiveConversation.mockReturnValue({
        messages: [],
      });

      renderChat();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('updates URL when conversationId transitions from temp to permanent', async () => {
      mockUseParams.mockReturnValue({});

      // Start with a temporary conversation ID
      mockUseActiveConversation.mockReturnValue({
        id: 'conversation__temp123',
        messages: [],
      });

      const { rerender } = renderChat();

      // Navigate should not be called for temporary ID
      expect(mockNavigate).not.toHaveBeenCalled();

      // Simulate conversation ID becoming permanent
      mockUseActiveConversation.mockReturnValue({
        id: 'permanent-conversation-123',
        messages: [],
      });

      // Force re-render to trigger the effect with new conversation ID
      rerender(
        <ChatBarProvider>
          <Chat />
        </ChatBarProvider>,
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/genie/chat/permanent-conversation-123', {
          replace: true,
        });
      });
    });

    it('uses replace: true to avoid adding to browser history', async () => {
      mockUseParams.mockReturnValue({});
      mockUseActiveConversation.mockReturnValue({
        id: 'conversation-456',
        messages: [],
      });

      renderChat();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ replace: true }),
        );
      });
    });
  });
});
