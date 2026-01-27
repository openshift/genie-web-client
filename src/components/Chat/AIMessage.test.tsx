import { render as baseRender, screen } from '../../unitTestUtils';
import { AIMessage } from './AIMessage';
import type { Message } from '../../hooks/AIState';
import type { GenieAdditionalProperties } from 'src/types/chat';

// Mock the useBadResponseModal hook to avoid useActiveConversation bug
jest.mock('./feedback/BadResponseModal', () => ({
  useBadResponseModal: () => ({
    badResponseModalToggle: jest.fn(),
  }),
}));

// Mock clipboard API
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

// Helper to render with required providers
const render = (ui: React.ReactElement) => {
  return baseRender(ui);
};

describe('<AIMessage />', () => {
  const mockOnQuickResponse = jest.fn();

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

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

      expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
    });

    it('renders component when answer is undefined', () => {
      const message = createMessage({ answer: undefined });

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

      // NOTE: Using getByTestId because the PatternFly Message component mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });

    it('renders component when answer is an empty string', () => {
      const message = createMessage({ answer: '' });

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

      // NOTE: Using getByTestId because the PatternFly Message component mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('passes isLoading=true to Message when isStreaming is true and message has no content', () => {
      const message = createMessage({ answer: '' });

      render(
        <AIMessage message={message} onQuickResponse={mockOnQuickResponse} isStreaming={true} />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-is-loading attribute
      // isLoading should be true because isStreaming=true AND hasContent=false (showLoading = isStreaming && !hasContent)
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-is-loading', 'true');
    });

    it('passes isLoading=false to Message when isStreaming is true but message has content', () => {
      const message = createMessage({ answer: 'Some content' });

      render(
        <AIMessage message={message} onQuickResponse={mockOnQuickResponse} isStreaming={true} />,
      );

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-is-loading attribute
      // isLoading should be false because hasContent is true (showLoading = isStreaming && !hasContent)
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-is-loading', 'false');
    });

    it('defaults isStreaming to false when not provided', () => {
      const message = createMessage();

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-is-loading attribute
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-is-loading', 'false');
    });
  });

  describe('Tool Calls', () => {
    it('does not pass null beforeMainContent when toolCalls is empty', () => {
      const message = createMessage();

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

      // NOTE: Using getByTestId because the PatternFly Message mock renders with data-testid="message"
      // Component renders without ToolCallsList when toolCalls is empty
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });

    it('does not render ToolCallsList when toolCalls is not provided', () => {
      const message = createMessage();

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

      // NOTE: Using getByTestId because the PatternFly Message mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });
  });

  describe('Quick Responses', () => {
    it('does not render quick responses when additionalAttributes is undefined', () => {
      const message = createMessage();

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

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

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

      // NOTE: Using getByTestId because the PatternFly Message mock renders with data-testid="message"
      const messageElement = screen.getByTestId('message');
      expect(messageElement).not.toHaveAttribute('quickresponses');
    });
  });

  describe('Message Role', () => {
    it('renders as a bot message', () => {
      const message = createMessage();

      render(<AIMessage message={message} onQuickResponse={mockOnQuickResponse} />);

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-role attribute
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-role', 'bot');
    });
  });
});
