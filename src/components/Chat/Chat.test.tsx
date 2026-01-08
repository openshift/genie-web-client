import { renderWithoutProviders, screen, waitFor } from '../../unitTestUtils';
import { Chat } from './Chat';
import { ChatBarProvider, useChatBar } from '../ChatBarContext';

// Mock the hooks
const mockUseMessages = jest.fn();
const mockUseSetActiveConversation = jest.fn();
const mockUseSendMessage = jest.fn();
const mockUseParams = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  useMessages: () => mockUseMessages(),
  useSendMessage: () => mockUseSendMessage(),
  useSetActiveConversation: () => mockUseSetActiveConversation(),
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useParams: () => mockUseParams(),
}));

describe('Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMessages.mockReturnValue([]);
    mockUseSetActiveConversation.mockReturnValue(jest.fn().mockResolvedValue(undefined));
    mockUseParams.mockReturnValue({});
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
        await waitFor(() => resolvePromise());
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

  describe('Message Rendering', () => {
    it('displays user messages correctly', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          message: 'Hello, how are you?',
          timestamp: '2025-01-15T10:00:00.000Z',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      });
    });

    it('displays bot messages correctly', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'bot',
          answer: 'I am doing well, thank you!',
          timestamp: '2025-01-15T10:00:01.000Z',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
      });
    });

    it('handles messages with query field', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          query: 'What is the weather?',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('What is the weather?')).toBeInTheDocument();
      });
    });

    it('handles messages with answer field', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'bot',
          answer: 'The weather is sunny today.',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('The weather is sunny today.')).toBeInTheDocument();
      });
    });

    it('handles messages with content field', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          content: 'This is content',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('This is content')).toBeInTheDocument();
      });
    });

    it('splits content at the separator string', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'bot',
          answer:
            'Some prefix text =====The following is the user query that was asked: Actual answer content',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        // NOTE: getByTestId is used because we need to check the textContent of the message element
        // which may contain whitespace that getByText cannot match exactly
        const message = screen.getByTestId('message');
        expect(message.textContent).toBe(' Actual answer content');
        expect(screen.queryByText('Some prefix text')).not.toBeInTheDocument();
      });
    });

    it('handles empty content', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'bot',
          answer: '',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      // Component should render without error even with empty content
      await waitFor(() => {
        expect(mockUseMessages).toHaveBeenCalled();
      });
    });

    it('displays multiple messages in order', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          message: 'First message',
        },
        {
          id: '2',
          role: 'bot',
          answer: 'Second message',
        },
        {
          id: '3',
          role: 'user',
          message: 'Third message',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
        expect(screen.getByText('Second message')).toBeInTheDocument();
        expect(screen.getByText('Third message')).toBeInTheDocument();
      });
    });

    it('uses timestamp from message if available', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      const timestamp = '2025-01-15T10:30:00.000Z';
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          message: 'Test message',
          timestamp,
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('uses createdAt if timestamp is not available', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      const createdAt = '2025-01-15T11:00:00.000Z';
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          message: 'Test message',
          createdAt,
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
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

    it('displays messages even without conversationId', () => {
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          message: 'Test message without conversation',
        },
      ]);
      mockUseParams.mockReturnValue({});

      renderChat();

      expect(screen.getByText('Test message without conversation')).toBeInTheDocument();
    });
  });

  describe('Message Name Display', () => {
    it('sets name to "Genie" for bot messages', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'bot',
          answer: 'Bot response',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        // NOTE: getByTestId is used because we need to verify data attributes (data-name, data-role)
        // which are not accessible through standard RTL queries
        const message = screen.getByTestId('message');
        expect(message).toHaveAttribute('data-name', 'Genie');
        expect(message).toHaveAttribute('data-role', 'bot');
      });
    });

    it('sets name to "You" for user messages', async () => {
      const mockSetActiveConversation = jest.fn().mockResolvedValue(undefined);
      mockUseSetActiveConversation.mockReturnValue(mockSetActiveConversation);
      mockUseMessages.mockReturnValue([
        {
          id: '1',
          role: 'user',
          message: 'User message',
        },
      ]);
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      await waitFor(() => {
        // NOTE: getByTestId is used because we need to verify data attributes (data-name, data-role)
        // which are not accessible through standard RTL queries
        const message = screen.getByTestId('message');
        expect(message).toHaveAttribute('data-name', 'You');
        expect(message).toHaveAttribute('data-role', 'user');
      });
    });
  });
});
