import { renderWithoutProviders as render, screen, user } from '../../unitTestUtils';
import { AIMessage } from './AIMessage';
import type { Message } from '../../hooks/AIState';
import type { GenieAdditionalProperties } from 'src/types/chat';

// mock the useBadResponseModal hook
const mockBadResponseModalToggle = jest.fn();
jest.mock('./feedback/BadResponseModal', () => ({
  useBadResponseModal: () => ({
    badResponseModalToggle: mockBadResponseModalToggle,
  }),
}));

// mock clipboard API
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

// mock useSendFeedback hook
const mockSendFeedback = jest.fn();
jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useSendFeedback: () => ({
    sendFeedback: mockSendFeedback,
    isLoading: false,
    error: null,
    success: false,
  }),
}));

// mock toast alerts
const mockAddAlert = jest.fn();
jest.mock('../toast-alerts/ToastAlertProvider', () => ({
  useToastAlerts: () => ({
    addAlert: mockAddAlert,
    removeAlert: jest.fn(),
    alerts: [],
  }),
}));

describe('<AIMessage />', () => {
  const mockOnQuickResponse = jest.fn();
  const defaultConversationId = 'test-conversation-id';
  const defaultUserQuestion = 'Test user question';

  const createMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'test-message-id',
    role: 'bot',
    answer: 'This is a test response from the AI.',
    date: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Message Content', () => {
    it('displays the message answer content', () => {
      const message = createMessage({ answer: 'Hello, how can I help you?' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
    });

    it('renders component when answer is undefined', () => {
      const message = createMessage({ answer: undefined });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message component mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });

    it('renders component when answer is an empty string', () => {
      const message = createMessage({ answer: '' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message component mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('passes isLoading=true to Message when isStreaming is true and message has no content', () => {
      const message = createMessage({ answer: '' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
          isStreaming={true}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-is-loading attribute
      // isLoading should be true because isStreaming=true AND hasContent=false (showLoading = isStreaming && !hasContent)
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-is-loading', 'true');
    });

    it('passes isLoading=false to Message when isStreaming is true but message has content', () => {
      const message = createMessage({ answer: 'Some content' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
          isStreaming={true}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-is-loading attribute
      // isLoading should be false because hasContent is true (showLoading = isStreaming && !hasContent)
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-is-loading', 'false');
    });

    it('defaults isStreaming to false when not provided', () => {
      const message = createMessage();

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-is-loading attribute
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-is-loading', 'false');
    });
  });

  describe('Tool Calls', () => {
    it('renders message without tool calls when none present', () => {
      const message = createMessage();

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });
  });

  describe('Quick Responses', () => {
    it('does not render quick responses when additionalAttributes is undefined', () => {
      const message = createMessage();

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock renders with data-testid="message"
      // The quickresponses attribute should not be present when undefined
      const messageElement = screen.getByTestId('message');
      expect(messageElement).not.toHaveAttribute('quickresponses');
    });

    it('does not render quick responses when quickResponses items are empty', () => {
      const additionalAttributes: GenieAdditionalProperties = {
        quickResponses: {
          key: 'build',
          items: [],
        },
      };
      const message = createMessage({ additionalAttributes });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock renders with data-testid="message"
      const messageElement = screen.getByTestId('message');
      expect(messageElement).not.toHaveAttribute('quickresponses');
    });
  });

  describe('Message Role', () => {
    it('renders as a bot message', () => {
      const message = createMessage();

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-role attribute
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-role', 'bot');
    });
  });

  describe('Feedback Buttons', () => {
    beforeEach(() => {
      mockSendFeedback.mockClear();
      mockSendFeedback.mockResolvedValue(undefined);
      mockBadResponseModalToggle.mockClear();
      mockAddAlert.mockClear();
    });

    it('calls sendFeedback with positive sentiment when thumbs up is clicked', async () => {
      const message = createMessage({ answer: 'Test AI response' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      const thumbsUpButton = screen.getByLabelText('Good response');
      await user.click(thumbsUpButton);

      expect(mockSendFeedback).toHaveBeenCalledTimes(1);
      expect(mockSendFeedback).toHaveBeenCalledWith({
        conversation_id: defaultConversationId,
        user_question: defaultUserQuestion,
        llm_response: 'Test AI response',
        isPositive: true,
      });
    });

    it('opens bad response modal when thumbs down is clicked', async () => {
      const message = createMessage({ answer: 'Test AI response' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      const thumbsDownButton = screen.getByLabelText('Bad response');
      await user.click(thumbsDownButton);

      expect(mockBadResponseModalToggle).toHaveBeenCalledTimes(1);
      expect(mockBadResponseModalToggle).toHaveBeenCalledWith(message);
      expect(mockSendFeedback).not.toHaveBeenCalled();
    });

    it('deselects thumbs up when clicked again', async () => {
      const message = createMessage();

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      const thumbsUpButton = screen.getByLabelText('Good response');

      // first click - should send feedback
      await user.click(thumbsUpButton);
      expect(mockSendFeedback).toHaveBeenCalledTimes(1);

      // second click - should not send feedback again
      await user.click(thumbsUpButton);
      expect(mockSendFeedback).toHaveBeenCalledTimes(1);
    });

    it('toggles thumbs down button selection', async () => {
      const message = createMessage();

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      const thumbsDownButton = screen.getByLabelText('Bad response');

      // first click - should open modal and set button state
      await user.click(thumbsDownButton);
      expect(mockBadResponseModalToggle).toHaveBeenCalledTimes(1);
      expect(thumbsDownButton).toHaveAttribute('data-is-clicked', 'true');

      // second click - should deselect button (no modal opens)
      await user.click(thumbsDownButton);
      expect(mockBadResponseModalToggle).toHaveBeenCalledTimes(1); // still 1
      expect(thumbsDownButton).toHaveAttribute('data-is-clicked', 'false');
    });

    it('switches from thumbs up to thumbs down', async () => {
      const message = createMessage({ answer: 'Response text' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      const thumbsUpButton = screen.getByLabelText('Good response');
      const thumbsDownButton = screen.getByLabelText('Bad response');

      // rate as good
      await user.click(thumbsUpButton);
      expect(mockSendFeedback).toHaveBeenCalledWith({
        conversation_id: defaultConversationId,
        user_question: defaultUserQuestion,
        llm_response: 'Response text',
        isPositive: true,
      });
      expect(thumbsUpButton).toHaveAttribute('data-is-clicked', 'true');
      expect(thumbsDownButton).toHaveAttribute('data-is-clicked', 'false');

      // switch to bad rating - opens modal and updates button states
      await user.click(thumbsDownButton);
      expect(mockSendFeedback).toHaveBeenCalledTimes(1);
      expect(mockBadResponseModalToggle).toHaveBeenCalledTimes(1);
      expect(mockBadResponseModalToggle).toHaveBeenCalledWith(message);
      // thumbs up should be deselected, thumbs down should be selected
      expect(thumbsUpButton).toHaveAttribute('data-is-clicked', 'false');
      expect(thumbsDownButton).toHaveAttribute('data-is-clicked', 'true');
    });

    it('switches from thumbs down to thumbs up', async () => {
      const message = createMessage({ answer: 'Response text' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      const thumbsUpButton = screen.getByLabelText('Good response');
      const thumbsDownButton = screen.getByLabelText('Bad response');

      // rate as bad - opens modal
      await user.click(thumbsDownButton);
      expect(mockBadResponseModalToggle).toHaveBeenCalledWith(message);

      // switch to good rating
      await user.click(thumbsUpButton);
      expect(mockSendFeedback).toHaveBeenCalledTimes(1);
      expect(mockSendFeedback).toHaveBeenCalledWith({
        conversation_id: defaultConversationId,
        user_question: defaultUserQuestion,
        llm_response: 'Response text',
        isPositive: true,
      });
    });

    it('handles empty message content', async () => {
      const message = createMessage({ answer: '' });

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      const thumbsUpButton = screen.getByLabelText('Good response');
      await user.click(thumbsUpButton);

      expect(mockSendFeedback).toHaveBeenCalledWith({
        conversation_id: defaultConversationId,
        user_question: defaultUserQuestion,
        llm_response: '',
        isPositive: true,
      });
    });

    it('resets button state on feedback submission error', async () => {
      const message = createMessage({ answer: 'Test response' });
      mockSendFeedback.mockRejectedValueOnce(new Error('Network error'));

      render(
        <AIMessage
          message={message}
          conversationId={defaultConversationId}
          userQuestion={defaultUserQuestion}
          onQuickResponse={mockOnQuickResponse}
        />,
      );

      const thumbsUpButton = screen.getByLabelText('Good response');

      // button should have isClicked=false initially
      expect(thumbsUpButton).toHaveAttribute('data-is-clicked', 'false');

      // click thumbs up
      await user.click(thumbsUpButton);

      // button state gets reset after error, so should be unclicked again
      expect(thumbsUpButton).toHaveAttribute('data-is-clicked', 'false');
    });
  });
});
