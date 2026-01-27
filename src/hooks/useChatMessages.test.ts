import { renderHook, act } from '../unitTestUtils';
import { useChatMessages } from './useChatMessages';
import type { Message } from './AIState';
import type { GenieAdditionalProperties } from '../types/chat';

// Mock the AIState hooks
const mockUseMessages = jest.fn();
const mockUseStreamChunk = jest.fn();
const mockUseInProgress = jest.fn();
const mockUseSendStreamMessage = jest.fn();

jest.mock('./AIState', () => ({
  useMessages: () => mockUseMessages(),
  useStreamChunk: () => mockUseStreamChunk(),
  useInProgress: () => mockUseInProgress(),
  useSendStreamMessage: () => mockUseSendStreamMessage(),
}));

// Mock useThrottle to return value immediately for predictable testing
jest.mock('./useThrottle', () => ({
  useThrottle: <T>(value: T) => value,
}));

// Helper to create mock messages with correct shape
const createMessage = (
  id: string,
  role: 'user' | 'bot',
  answer: string,
): Message<GenieAdditionalProperties> => ({
  id,
  role,
  answer,
  date: new Date('2024-01-01T00:00:00Z'),
});

describe('useChatMessages', () => {
  const mockSendStreamMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMessages.mockReturnValue([]);
    mockUseStreamChunk.mockReturnValue(null);
    mockUseInProgress.mockReturnValue(false);
    mockUseSendStreamMessage.mockReturnValue(mockSendStreamMessage);
  });

  describe('messages', () => {
    it('returns empty messages array when no messages exist', () => {
      mockUseMessages.mockReturnValue([]);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.messages).toEqual([]);
    });

    it('returns messages from useMessages hook', () => {
      const messages = [
        createMessage('1', 'user', 'Hello'),
        createMessage('2', 'bot', 'Hi there!'),
      ];
      mockUseMessages.mockReturnValue(messages);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.messages).toEqual(messages);
    });
  });

  describe('streamingMessage', () => {
    it('returns null when not streaming', () => {
      mockUseInProgress.mockReturnValue(false);
      mockUseStreamChunk.mockReturnValue(null);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.streamingMessage).toBeNull();
    });

    it('returns null when inProgress is true but streamChunk has no messageId', () => {
      mockUseInProgress.mockReturnValue(true);
      mockUseStreamChunk.mockReturnValue({});

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.streamingMessage).toBeNull();
    });

    it('returns streaming message when inProgress and streamChunk has messageId', () => {
      mockUseInProgress.mockReturnValue(true);
      mockUseStreamChunk.mockReturnValue({
        messageId: 'stream-123',
        answer: 'Streaming content...',
      });

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.streamingMessage).toEqual({
        messageId: 'stream-123',
        content: 'Streaming content...',
      });
    });

    it('returns empty content when answer is undefined', () => {
      mockUseInProgress.mockReturnValue(true);
      mockUseStreamChunk.mockReturnValue({
        messageId: 'stream-123',
        answer: undefined,
      });

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.streamingMessage).toEqual({
        messageId: 'stream-123',
        content: '',
      });
    });

    it('returns null when inProgress is false even with streamChunk data', () => {
      mockUseInProgress.mockReturnValue(false);
      mockUseStreamChunk.mockReturnValue({
        messageId: 'stream-123',
        answer: 'Some content',
      });

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.streamingMessage).toBeNull();
    });
  });

  describe('isStreaming', () => {
    it('returns false when not in progress', () => {
      mockUseInProgress.mockReturnValue(false);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.isStreaming).toBe(false);
    });

    it('returns true when in progress', () => {
      mockUseInProgress.mockReturnValue(true);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.isStreaming).toBe(true);
    });
  });

  describe('sendMessage', () => {
    it('calls sendStreamMessage with the provided text', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.sendMessage('Hello, world!');
      });

      expect(mockSendStreamMessage).toHaveBeenCalledWith('Hello, world!');
    });

    it('calls sendStreamMessage for each invocation', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.sendMessage('First message');
        result.current.sendMessage('Second message');
      });

      expect(mockSendStreamMessage).toHaveBeenCalledTimes(2);
      expect(mockSendStreamMessage).toHaveBeenNthCalledWith(1, 'First message');
      expect(mockSendStreamMessage).toHaveBeenNthCalledWith(2, 'Second message');
    });

    it('maintains stable reference across re-renders', () => {
      const { result, rerender } = renderHook(() => useChatMessages());

      const firstSendMessage = result.current.sendMessage;
      rerender();
      const secondSendMessage = result.current.sendMessage;

      expect(firstSendMessage).toBe(secondSendMessage);
    });
  });

  describe('lastUserMessageIndex', () => {
    it('returns -1 when no messages exist', () => {
      mockUseMessages.mockReturnValue([]);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.lastUserMessageIndex).toBe(-1);
    });

    it('returns -1 when no user messages exist', () => {
      const messages = [
        createMessage('1', 'bot', 'Hello'),
        createMessage('2', 'bot', 'How can I help?'),
      ];
      mockUseMessages.mockReturnValue(messages);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.lastUserMessageIndex).toBe(-1);
    });

    it('returns index of the last user message', () => {
      const messages = [
        createMessage('1', 'user', 'Hello'),
        createMessage('2', 'bot', 'Hi!'),
        createMessage('3', 'user', 'How are you?'),
        createMessage('4', 'bot', 'Great!'),
      ];
      mockUseMessages.mockReturnValue(messages);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.lastUserMessageIndex).toBe(2);
    });

    it('returns correct index when last message is from user', () => {
      const messages = [createMessage('1', 'bot', 'Hello'), createMessage('2', 'user', 'Hi!')];
      mockUseMessages.mockReturnValue(messages);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.lastUserMessageIndex).toBe(1);
    });
  });

  describe('lastBotMessageIndex', () => {
    it('returns -1 when no messages exist', () => {
      mockUseMessages.mockReturnValue([]);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.lastBotMessageIndex).toBe(-1);
    });

    it('returns -1 when no bot messages exist', () => {
      const messages = [
        createMessage('1', 'user', 'Hello'),
        createMessage('2', 'user', 'Anyone there?'),
      ];
      mockUseMessages.mockReturnValue(messages);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.lastBotMessageIndex).toBe(-1);
    });

    it('returns index of the last bot message', () => {
      const messages = [
        createMessage('1', 'user', 'Hello'),
        createMessage('2', 'bot', 'Hi!'),
        createMessage('3', 'user', 'How are you?'),
        createMessage('4', 'bot', 'Great!'),
      ];
      mockUseMessages.mockReturnValue(messages);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.lastBotMessageIndex).toBe(3);
    });

    it('returns correct index when last message is from bot', () => {
      const messages = [createMessage('1', 'user', 'Hello'), createMessage('2', 'bot', 'Hi!')];
      mockUseMessages.mockReturnValue(messages);

      const { result } = renderHook(() => useChatMessages());

      expect(result.current.lastBotMessageIndex).toBe(1);
    });
  });

  describe('updates when dependencies change', () => {
    it('updates messages when useMessages returns new data', () => {
      const initialMessages = [createMessage('1', 'user', 'Hello')];
      mockUseMessages.mockReturnValue(initialMessages);

      const { result, rerender } = renderHook(() => useChatMessages());

      expect(result.current.messages).toEqual(initialMessages);

      const updatedMessages = [...initialMessages, createMessage('2', 'bot', 'Hi!')];
      mockUseMessages.mockReturnValue(updatedMessages);

      rerender();

      expect(result.current.messages).toEqual(updatedMessages);
    });

    it('updates isStreaming when inProgress changes', () => {
      mockUseInProgress.mockReturnValue(false);

      const { result, rerender } = renderHook(() => useChatMessages());

      expect(result.current.isStreaming).toBe(false);

      mockUseInProgress.mockReturnValue(true);
      rerender();

      expect(result.current.isStreaming).toBe(true);
    });
  });
});
