import { renderWithoutProviders as render, screen } from '../../unitTestUtils';
import { MessageList } from './MessageList';
import type { StreamingMessage } from '../../hooks/useChatMessages';

// Mock the useChatMessages hook
const mockUseChatMessages = jest.fn();

jest.mock('../../hooks/useChatMessages', () => ({
  useChatMessages: () => mockUseChatMessages(),
}));

// Mock useActiveConversation for conversationId
const mockUseActiveConversation = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useActiveConversation: () => mockUseActiveConversation(),
}));

// Mock child components to isolate MessageList testing
jest.mock('./ChatLoading', () => ({
  ChatLoading: () => <div data-testid="chat-loading">Loading...</div>,
}));

jest.mock('./ConversationNotFound', () => ({
  ConversationNotFound: () => <div data-testid="conversation-not-found">Not Found</div>,
}));

jest.mock('./UserMessage', () => ({
  UserMessage: ({
    message,
    isLastUserMessage,
  }: {
    message: { id: string; answer: string };
    isLastUserMessage: boolean;
  }) => (
    <div data-testid={`user-message-${message.id}`} data-is-last={isLastUserMessage}>
      {message.answer}
    </div>
  ),
}));

jest.mock('./AIMessage', () => ({
  AIMessage: ({
    message,
    isStreaming,
    conversationId,
    userQuestion,
  }: {
    message: { id: string; answer: string };
    isStreaming: boolean;
    conversationId: string;
    userQuestion: string;
  }) => (
    <div
      data-testid={`ai-message-${message.id}`}
      data-is-streaming={isStreaming}
      data-conversation-id={conversationId}
      data-user-question={userQuestion}
    >
      {message.answer}
    </div>
  ),
}));

// Helper to create default mock return value
const createMockChatMessagesReturn = (
  overrides: {
    messages?: Array<{ id: string; role: string; answer: string; date: Date }>;
    streamingMessage?: StreamingMessage | null;
    isStreaming?: boolean;
    lastUserMessageIndex?: number;
    lastBotMessageIndex?: number;
  } = {},
) => ({
  messages: [],
  streamingMessage: null,
  isStreaming: false,
  sendMessage: jest.fn(),
  lastUserMessageIndex: -1,
  lastBotMessageIndex: -1,
  ...overrides,
});

jest.mock('./feedback/utils', () => ({
  getUserQuestionForBotMessage: () => ({ answer: 'Test user question', role: 'user' }),
}));

describe('<MessageList />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatMessages.mockReturnValue(createMockChatMessagesReturn());
    mockUseActiveConversation.mockReturnValue({ id: 'test-conversation-id' });
  });

  describe('Loading State', () => {
    it('shows ChatLoading when isLoading is true and messages are empty', () => {
      mockUseChatMessages.mockReturnValue(createMockChatMessagesReturn({ messages: [] }));

      render(<MessageList isLoading={true} isValidConversationId={true} />);

      expect(screen.getByTestId('chat-loading')).toBeInTheDocument();
    });

    it('does not show ChatLoading when isLoading is true but messages exist', () => {
      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [{ id: '1', role: 'user', answer: 'Hello', date: new Date() }],
          lastUserMessageIndex: 0,
        }),
      );

      render(<MessageList isLoading={true} isValidConversationId={true} />);

      expect(screen.queryByTestId('chat-loading')).not.toBeInTheDocument();
    });

    it('does not show ChatLoading when isLoading is false', () => {
      mockUseChatMessages.mockReturnValue(createMockChatMessagesReturn({ messages: [] }));

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.queryByTestId('chat-loading')).not.toBeInTheDocument();
    });
  });

  describe('Invalid Conversation', () => {
    it('shows ConversationNotFound when isValidConversationId is false', () => {
      render(<MessageList isLoading={false} isValidConversationId={false} />);

      expect(screen.getByTestId('conversation-not-found')).toBeInTheDocument();
    });

    it('does not show ConversationNotFound when isValidConversationId is true', () => {
      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.queryByTestId('conversation-not-found')).not.toBeInTheDocument();
    });
  });

  describe('Message Rendering', () => {
    it('renders user messages using UserMessage component', () => {
      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [{ id: 'user-1', role: 'user', answer: 'Hello there', date: new Date() }],
          lastUserMessageIndex: 0,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.getByTestId('user-message-user-1')).toBeInTheDocument();
      expect(screen.getByText('Hello there')).toBeInTheDocument();
    });

    it('renders bot messages using AIMessage component', () => {
      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [{ id: 'bot-1', role: 'bot', answer: 'Hi, how can I help?', date: new Date() }],
          lastBotMessageIndex: 0,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.getByTestId('ai-message-bot-1')).toBeInTheDocument();
      expect(screen.getByText('Hi, how can I help?')).toBeInTheDocument();
    });

    it('renders multiple messages in order', () => {
      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [
            { id: 'user-1', role: 'user', answer: 'First message', date: new Date() },
            { id: 'bot-1', role: 'bot', answer: 'Second message', date: new Date() },
            { id: 'user-2', role: 'user', answer: 'Third message', date: new Date() },
          ],
          lastUserMessageIndex: 2,
          lastBotMessageIndex: 1,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.getByTestId('user-message-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('ai-message-bot-1')).toBeInTheDocument();
      expect(screen.getByTestId('user-message-user-2')).toBeInTheDocument();
    });

    it('renders empty message list without errors', () => {
      mockUseChatMessages.mockReturnValue(createMockChatMessagesReturn({ messages: [] }));

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      // NOTE: Using getByTestId because the MessageBox mock renders with data-testid="message-box"
      expect(screen.getByTestId('message-box')).toBeInTheDocument();
    });
  });

  describe('Last User Message Detection', () => {
    it('marks the last user message with isLastUserMessage=true', () => {
      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [
            { id: 'user-1', role: 'user', answer: 'First', date: new Date() },
            { id: 'bot-1', role: 'bot', answer: 'Response', date: new Date() },
            { id: 'user-2', role: 'user', answer: 'Second', date: new Date() },
          ],
          lastUserMessageIndex: 2,
          lastBotMessageIndex: 1,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const firstUserMessage = screen.getByTestId('user-message-user-1');
      const lastUserMessage = screen.getByTestId('user-message-user-2');

      expect(firstUserMessage).toHaveAttribute('data-is-last', 'false');
      expect(lastUserMessage).toHaveAttribute('data-is-last', 'true');
    });

    it('marks single user message as last user message', () => {
      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [{ id: 'user-1', role: 'user', answer: 'Only user message', date: new Date() }],
          lastUserMessageIndex: 0,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const userMessage = screen.getByTestId('user-message-user-1');
      expect(userMessage).toHaveAttribute('data-is-last', 'true');
    });
  });

  describe('Streaming State', () => {
    it('renders streaming message with isStreaming=true when streaming is active', () => {
      const streamingMessage: StreamingMessage = {
        messageId: 'bot-1',
        content: 'Streaming answer...',
      };

      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [
            { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
            { id: 'bot-1', role: 'bot', answer: 'Streaming answer...', date: new Date() },
          ],
          streamingMessage,
          isStreaming: true,
          lastUserMessageIndex: 0,
          lastBotMessageIndex: 1,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      // The streaming message should be rendered with isStreaming=true
      const aiMessage = screen.getByTestId('ai-message-bot-1');
      expect(aiMessage).toHaveAttribute('data-is-streaming', 'true');
    });

    it('passes isStreaming=false to bot messages when not streaming', () => {
      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [
            { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
            { id: 'bot-1', role: 'bot', answer: 'Answer', date: new Date() },
          ],
          isStreaming: false,
          lastUserMessageIndex: 0,
          lastBotMessageIndex: 1,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const aiMessage = screen.getByTestId('ai-message-bot-1');
      expect(aiMessage).toHaveAttribute('data-is-streaming', 'false');
    });

    it('only marks the last bot message as streaming when multiple bot messages exist', () => {
      const streamingMessage: StreamingMessage = {
        messageId: 'bot-2',
        content: 'Second response',
      };

      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [
            { id: 'bot-1', role: 'bot', answer: 'First response', date: new Date() },
            { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
            { id: 'bot-2', role: 'bot', answer: 'Second response', date: new Date() },
          ],
          streamingMessage,
          isStreaming: true,
          lastUserMessageIndex: 1,
          lastBotMessageIndex: 2,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const firstBotMessage = screen.getByTestId('ai-message-bot-1');
      const lastBotMessage = screen.getByTestId('ai-message-bot-2');

      expect(firstBotMessage).toHaveAttribute('data-is-streaming', 'false');
      expect(lastBotMessage).toHaveAttribute('data-is-streaming', 'true');
    });
  });
});
