import { renderWithoutProviders as render, screen } from '../../unitTestUtils';
import { MessageList } from './MessageList';

// Mock the hooks
const mockUseMessages = jest.fn();
const mockUseSendStreamMessage = jest.fn();
const mockUseStreamChunk = jest.fn();
const mockUseInProgress = jest.fn();
const mockUseActiveConversation = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  useMessages: () => mockUseMessages(),
  useSendStreamMessage: () => mockUseSendStreamMessage(),
  useStreamChunk: () => mockUseStreamChunk(),
  useInProgress: () => mockUseInProgress(),
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

jest.mock('./useToolCalls', () => ({
  useToolCalls: () => ({ toolCallsByMessage: {} }),
}));

jest.mock('./messageHelpers', () => ({
  getUserQuestionForBotMessage: () => 'Test user question',
}));

describe('<MessageList />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMessages.mockReturnValue([]);
    mockUseSendStreamMessage.mockReturnValue(jest.fn());
    mockUseStreamChunk.mockReturnValue(undefined);
    mockUseInProgress.mockReturnValue(false);
    mockUseActiveConversation.mockReturnValue({ id: 'test-conversation-id' });
  });

  describe('Loading State', () => {
    it('shows ChatLoading when isLoading is true and messages are empty', () => {
      mockUseMessages.mockReturnValue([]);

      render(<MessageList isLoading={true} isValidConversationId={true} />);

      expect(screen.getByTestId('chat-loading')).toBeInTheDocument();
    });

    it('does not show ChatLoading when isLoading is true but messages exist', () => {
      mockUseMessages.mockReturnValue([
        { id: '1', role: 'user', answer: 'Hello', date: new Date() },
      ]);

      render(<MessageList isLoading={true} isValidConversationId={true} />);

      expect(screen.queryByTestId('chat-loading')).not.toBeInTheDocument();
    });

    it('does not show ChatLoading when isLoading is false', () => {
      mockUseMessages.mockReturnValue([]);

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
      mockUseMessages.mockReturnValue([
        { id: 'user-1', role: 'user', answer: 'Hello there', date: new Date() },
      ]);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.getByTestId('user-message-user-1')).toBeInTheDocument();
      expect(screen.getByText('Hello there')).toBeInTheDocument();
    });

    it('renders bot messages using AIMessage component', () => {
      mockUseMessages.mockReturnValue([
        { id: 'bot-1', role: 'bot', answer: 'Hi, how can I help?', date: new Date() },
      ]);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.getByTestId('ai-message-bot-1')).toBeInTheDocument();
      expect(screen.getByText('Hi, how can I help?')).toBeInTheDocument();
    });

    it('renders multiple messages in order', () => {
      mockUseMessages.mockReturnValue([
        { id: 'user-1', role: 'user', answer: 'First message', date: new Date() },
        { id: 'bot-1', role: 'bot', answer: 'Second message', date: new Date() },
        { id: 'user-2', role: 'user', answer: 'Third message', date: new Date() },
      ]);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.getByTestId('user-message-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('ai-message-bot-1')).toBeInTheDocument();
      expect(screen.getByTestId('user-message-user-2')).toBeInTheDocument();
    });

    it('renders empty message list without errors', () => {
      mockUseMessages.mockReturnValue([]);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      // NOTE: Using getByTestId because the MessageBox mock renders with data-testid="message-box"
      expect(screen.getByTestId('message-box')).toBeInTheDocument();
    });
  });

  describe('Last User Message Detection', () => {
    it('marks the last user message with isLastUserMessage=true', () => {
      mockUseMessages.mockReturnValue([
        { id: 'user-1', role: 'user', answer: 'First', date: new Date() },
        { id: 'bot-1', role: 'bot', answer: 'Response', date: new Date() },
        { id: 'user-2', role: 'user', answer: 'Second', date: new Date() },
      ]);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const firstUserMessage = screen.getByTestId('user-message-user-1');
      const lastUserMessage = screen.getByTestId('user-message-user-2');

      expect(firstUserMessage).toHaveAttribute('data-is-last', 'false');
      expect(lastUserMessage).toHaveAttribute('data-is-last', 'true');
    });

    it('marks single user message as last user message', () => {
      mockUseMessages.mockReturnValue([
        { id: 'user-1', role: 'user', answer: 'Only user message', date: new Date() },
      ]);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const userMessage = screen.getByTestId('user-message-user-1');
      expect(userMessage).toHaveAttribute('data-is-last', 'true');
    });
  });

  describe('Streaming State', () => {
    it('passes isStreaming=true to last bot message when inProgress is true', () => {
      mockUseMessages.mockReturnValue([
        { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
        { id: 'bot-1', role: 'bot', answer: 'Answer', date: new Date() },
      ]);
      mockUseInProgress.mockReturnValue(true);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const aiMessage = screen.getByTestId('ai-message-bot-1');
      expect(aiMessage).toHaveAttribute('data-is-streaming', 'true');
    });

    it('passes isStreaming=false to bot messages when inProgress is false', () => {
      mockUseMessages.mockReturnValue([
        { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
        { id: 'bot-1', role: 'bot', answer: 'Answer', date: new Date() },
      ]);
      mockUseInProgress.mockReturnValue(false);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const aiMessage = screen.getByTestId('ai-message-bot-1');
      expect(aiMessage).toHaveAttribute('data-is-streaming', 'false');
    });

    it('only marks the last bot message as streaming when multiple bot messages exist', () => {
      mockUseMessages.mockReturnValue([
        { id: 'bot-1', role: 'bot', answer: 'First response', date: new Date() },
        { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
        { id: 'bot-2', role: 'bot', answer: 'Second response', date: new Date() },
      ]);
      mockUseInProgress.mockReturnValue(true);

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      const firstBotMessage = screen.getByTestId('ai-message-bot-1');
      const lastBotMessage = screen.getByTestId('ai-message-bot-2');

      expect(firstBotMessage).toHaveAttribute('data-is-streaming', 'false');
      expect(lastBotMessage).toHaveAttribute('data-is-streaming', 'true');
    });
  });
});
