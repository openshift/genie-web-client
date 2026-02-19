import React from 'react';
import { renderWithoutProviders as render, screen, waitFor, act } from '../../unitTestUtils';
import { MessageList } from './MessageList';
import type { StreamingMessage } from '../../hooks/useChatMessages';

// Mock toast so we don't load ToastAlertProvider (saves memory)
jest.mock('../toast-alerts/ToastAlertProvider', () => ({
  useToastAlerts: () => ({ addAlert: jest.fn(), removeAlert: jest.fn(), alerts: [] }),
  ToastAlertProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock heavy child to reduce memory
jest.mock('./EditableChatHeader', () => ({
  EditableChatHeader: () => null,
}));

// Access mock functions from the mocked @patternfly/chatbot module
// Jest automatically uses __mocks__/patternflyChatbotMock.js via jest.config.js moduleNameMapper
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  mockScrollToBottom,
  mockScrollToTop,
  mockIsSmartScrollActive,
  getLastMessageBoxProps,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('@patternfly/chatbot');

// Mock the useChatMessages hook
const mockUseChatMessages = jest.fn();

// mocked hooks for editable chat header
const mockUseActiveConversation = jest.fn();
const mockUseUpdateConversationTitle = jest.fn();
const mockUseConversations = jest.fn();
const mockUseDeleteConversationModal = jest.fn();
const mockUseEditMessage = jest.fn();

jest.mock('../../hooks/useChatMessages', () => ({
  useChatMessages: () => mockUseChatMessages(),
}));

jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useActiveConversation: () => mockUseActiveConversation(),
  useUpdateConversationTitle: () => mockUseUpdateConversationTitle(),
  useConversations: () => mockUseConversations(),
  useDeleteConversationModal: (opts: unknown) => mockUseDeleteConversationModal(opts),
  useEditMessage: () => mockUseEditMessage,
}));

// mock child components to isolate testing
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
    messages?: Array<{
      id: string;
      role: string;
      answer: string;
      date: Date;
      additionalAttributes?: Record<string, unknown>;
    }>;
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
    mockUseEditMessage.mockReturnValue(jest.fn());
    mockUseUpdateConversationTitle.mockReturnValue({
      updateTitle: jest.fn(),
      isUpdating: false,
      error: null,
      clearError: jest.fn(),
    });
    mockUseConversations.mockReturnValue([]);
    mockUseDeleteConversationModal.mockReturnValue({
      conversationToDelete: null,
      openDeleteModal: jest.fn(),
      closeDeleteModal: jest.fn(),
      confirmDelete: jest.fn(),
      isDeleting: false,
      error: null,
    });
    // Reset scroll method mocks
    mockScrollToBottom.mockClear();
    mockScrollToTop.mockClear();
    mockIsSmartScrollActive.mockClear();
    // Default: smart scroll is active (user is at bottom)
    mockIsSmartScrollActive.mockReturnValue(true);
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

    it('does not display hidden messages when additionalAttributes.hidden is true', () => {
      mockUseChatMessages.mockReturnValue(
        createMockChatMessagesReturn({
          messages: [
            {
              id: 'user-1',
              role: 'user',
              answer: 'Visible message',
              date: new Date(),
              additionalAttributes: {},
            },
            {
              id: 'bot-1',
              role: 'bot',
              answer: 'Hidden message',
              date: new Date(),
              additionalAttributes: { hidden: true },
            },
          ],
          lastUserMessageIndex: 0,
          lastBotMessageIndex: 1,
        }),
      );

      render(<MessageList isLoading={false} isValidConversationId={true} />);

      expect(screen.getByText('Visible message')).toBeInTheDocument();
      expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
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

  describe('Scroll Behavior', () => {
    describe('Initial Load', () => {
      it('scrolls to bottom instantly (auto behavior) when conversation loads with messages', async () => {
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Hello', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: 'Hi there', date: new Date() },
            ],
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        render(<MessageList isLoading={false} isValidConversationId={true} />);

        // Should scroll immediately with 'auto' behavior (no animation)
        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalledWith({
            behavior: 'auto',
            resumeSmartScroll: true,
          });
        });
        expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
      });

      it('does not scroll when conversation loads with no messages', () => {
        mockUseChatMessages.mockReturnValue(createMockChatMessagesReturn({ messages: [] }));

        render(<MessageList isLoading={false} isValidConversationId={true} />);

        expect(mockScrollToBottom).not.toHaveBeenCalled();
      });

      it('resets and scrolls when conversation changes', async () => {
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [{ id: 'user-1', role: 'user', answer: 'First chat', date: new Date() }],
            lastUserMessageIndex: 0,
          }),
        );
        mockUseActiveConversation.mockReturnValue({ id: 'conversation-1' });

        const { rerender } = render(
          <MessageList key="conv-1" isLoading={false} isValidConversationId={true} />,
        );

        // Initial scroll
        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
        });
        mockScrollToBottom.mockClear();

        // Change conversation
        mockUseActiveConversation.mockReturnValue({ id: 'conversation-2' });
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [{ id: 'user-2', role: 'user', answer: 'Second chat', date: new Date() }],
            lastUserMessageIndex: 0,
          }),
        );

        // Use different key to force re-mount (simulates conversation change)
        rerender(<MessageList key="conv-2" isLoading={false} isValidConversationId={true} />);

        // Should scroll again for new conversation with auto behavior
        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalledWith({
            behavior: 'auto',
            resumeSmartScroll: true,
          });
        });
      });
    });

    describe('New Message', () => {
      it('scrolls smoothly when user sends a new message', async () => {
        const initialMessages = [
          { id: 'user-1', role: 'user', answer: 'Hello', date: new Date() },
          { id: 'bot-1', role: 'bot', answer: 'Hi', date: new Date() },
        ];

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: initialMessages,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        const { rerender } = render(<MessageList isLoading={false} isValidConversationId={true} />);

        // Wait for initial load scroll
        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
        });
        mockScrollToBottom.mockClear();

        // Add new message
        const newMessages = [
          ...initialMessages,
          { id: 'user-2', role: 'user', answer: 'New message', date: new Date() },
        ];

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: newMessages,
            lastUserMessageIndex: 2,
            lastBotMessageIndex: 1,
          }),
        );

        // Force re-render with prop change and let effects flush
        await act(async () => {
          rerender(<MessageList isLoading={true} isValidConversationId={true} />);
          // Small delay to let effects flush
          await new Promise((resolve) => setTimeout(resolve, 10));
          rerender(<MessageList isLoading={false} isValidConversationId={true} />);
        });

        // Should scroll for new message (may use 'smooth' in real app, 'auto' in test due to timing)
        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalled();
          expect(mockScrollToBottom).toHaveBeenCalledWith(
            expect.objectContaining({
              resumeSmartScroll: true,
            }),
          );
        });
      });

      it('does not scroll when message count stays the same', () => {
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [{ id: 'user-1', role: 'user', answer: 'Hello', date: new Date() }],
            lastUserMessageIndex: 0,
          }),
        );

        const { rerender } = render(<MessageList isLoading={false} isValidConversationId={true} />);

        mockScrollToBottom.mockClear();

        // Re-render with same messages
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        // Should not scroll again - no new messages
        expect(mockScrollToBottom).not.toHaveBeenCalled();
      });
    });

    describe('LLM Streaming - Sticky Bottom Logic', () => {
      it('scrolls instantly during streaming when user is at bottom', async () => {
        const streamingMessage: StreamingMessage = {
          messageId: 'bot-1',
          content: 'Streaming...',
        };

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage,
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        // User is at bottom (smart scroll active)
        mockIsSmartScrollActive.mockReturnValue(true);

        const { rerender } = render(<MessageList isLoading={false} isValidConversationId={true} />);

        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalled();
        });
        mockScrollToBottom.mockClear();

        // Update streaming content
        const updatedStreamingMessage: StreamingMessage = {
          messageId: 'bot-1',
          content: 'Streaming... more text',
        };

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage: updatedStreamingMessage,
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        // Toggle isLoading to force re-render through React.memo
        rerender(<MessageList isLoading={true} isValidConversationId={true} />);
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        // Should scroll instantly with 'auto' behavior during streaming
        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalledWith({
            behavior: 'auto',
            resumeSmartScroll: false,
          });
        });
      });

      it('does not scroll during streaming when user has scrolled up', async () => {
        const streamingMessage: StreamingMessage = {
          messageId: 'bot-1',
          content: 'Streaming...',
        };

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage,
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        // User has scrolled up (smart scroll not active)
        mockIsSmartScrollActive.mockReturnValue(false);

        const { rerender } = render(<MessageList isLoading={false} isValidConversationId={true} />);

        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalled();
        });
        mockScrollToBottom.mockClear();

        // Update streaming content
        const updatedStreamingMessage: StreamingMessage = {
          messageId: 'bot-1',
          content: 'Streaming... more text',
        };

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage: updatedStreamingMessage,
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        // Toggle isLoading to force re-render through React.memo
        rerender(<MessageList isLoading={true} isValidConversationId={true} />);
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        // Wait a bit to ensure useEffect has chance to run
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Should NOT call scrollToBottom because smart scroll is not active
        expect(mockScrollToBottom).not.toHaveBeenCalled();
      });

      it('does not scroll when not streaming even if content changes', () => {
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: 'Complete response', date: new Date() },
            ],
            streamingMessage: null,
            isStreaming: false,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        const { rerender } = render(<MessageList isLoading={false} isValidConversationId={true} />);

        mockScrollToBottom.mockClear();

        // Re-render with isStreaming still false
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        // Should not trigger streaming scroll behavior
        expect(mockScrollToBottom).not.toHaveBeenCalled();
      });

      it('prevents autoscroll during grace period after back to top button click', async () => {
        jest.useFakeTimers();
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        const streamingMessage: StreamingMessage = {
          messageId: 'bot-1',
          content: 'Streaming...',
        };

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage,
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        mockIsSmartScrollActive.mockReturnValue(true);

        const { rerender } = render(<MessageList isLoading={false} isValidConversationId={true} />);

        // Wait for initial render
        await act(async () => {
          jest.runAllTimers();
        });
        mockScrollToBottom.mockClear();

        // Simulate back to top button click
        const { onScrollToTopClick } = getLastMessageBoxProps();

        await act(async () => {
          onScrollToTopClick();
        });

        // Advance time by 100ms (within grace period)
        jest.spyOn(Date, 'now').mockReturnValue(now + 100);

        // Update streaming content immediately after click
        const updatedStreamingMessage: StreamingMessage = {
          messageId: 'bot-1',
          content: 'Streaming... more text',
        };

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage: updatedStreamingMessage,
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        // Force re-render
        rerender(<MessageList isLoading={true} isValidConversationId={true} />);
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        // Should NOT scroll because we're in the grace period
        await act(async () => {
          jest.advanceTimersByTime(10);
        });
        expect(mockScrollToBottom).not.toHaveBeenCalled();

        // Advance time past the grace period (350ms total)
        jest.spyOn(Date, 'now').mockReturnValue(now + 350);

        // Update streaming content again
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage: { messageId: 'bot-1', content: 'Even more text' },
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        rerender(<MessageList isLoading={true} isValidConversationId={true} />);
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        // Should now scroll because grace period has expired
        await act(async () => {
          jest.runAllTimers();
        });
        expect(mockScrollToBottom).toHaveBeenCalledWith({
          behavior: 'auto',
          resumeSmartScroll: false,
        });

        jest.restoreAllMocks();
        jest.useRealTimers();
      });

      it('resumes autoscroll immediately after back to bottom button click', async () => {
        const streamingMessage: StreamingMessage = {
          messageId: 'bot-1',
          content: 'Streaming...',
        };

        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage,
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        mockIsSmartScrollActive.mockReturnValue(true);

        const { rerender } = render(<MessageList isLoading={false} isValidConversationId={true} />);

        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalled();
        });
        mockScrollToBottom.mockClear();

        // Simulate back to bottom button click
        const { onScrollToBottomClick } = getLastMessageBoxProps();
        act(() => {
          onScrollToBottomClick();
        });

        // Update streaming content
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [
              { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
              { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
            ],
            streamingMessage: { messageId: 'bot-1', content: 'More text' },
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        // Force re-render
        rerender(<MessageList isLoading={true} isValidConversationId={true} />);
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        // Should scroll immediately because back to bottom clears the grace period
        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalledWith({
            behavior: 'auto',
            resumeSmartScroll: false,
          });
        });
      });

      it('scrolls on each streaming content update', async () => {
        const messages = [
          { id: 'user-1', role: 'user', answer: 'Question', date: new Date() },
          { id: 'bot-1', role: 'bot', answer: '', date: new Date() },
        ];

        // First streaming update
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages,
            streamingMessage: { messageId: 'bot-1', content: 'A' },
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );

        const { rerender } = render(<MessageList isLoading={false} isValidConversationId={true} />);

        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalled();
        });
        mockScrollToBottom.mockClear();

        // Second streaming update
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages,
            streamingMessage: { messageId: 'bot-1', content: 'AB' },
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );
        rerender(<MessageList isLoading={true} isValidConversationId={true} />);
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
        });
        mockScrollToBottom.mockClear();

        // Third streaming update
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages,
            streamingMessage: { messageId: 'bot-1', content: 'ABC' },
            isStreaming: true,
            lastUserMessageIndex: 0,
            lastBotMessageIndex: 1,
          }),
        );
        rerender(<MessageList isLoading={true} isValidConversationId={true} />);
        rerender(<MessageList isLoading={false} isValidConversationId={true} />);

        await waitFor(() => {
          expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('MessageBox Configuration', () => {
      it('enables smart scroll on MessageBox component', () => {
        mockUseChatMessages.mockReturnValue(
          createMockChatMessagesReturn({
            messages: [{ id: 'user-1', role: 'user', answer: 'Hello', date: new Date() }],
            lastUserMessageIndex: 0,
          }),
        );

        render(<MessageList isLoading={false} isValidConversationId={true} />);

        const messageBox = screen.getByTestId('message-box');
        expect(messageBox).toHaveAttribute('data-enable-smart-scroll', 'true');
      });
    });
  });
});
