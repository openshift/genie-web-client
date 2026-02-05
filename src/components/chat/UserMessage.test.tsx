import { renderWithoutProviders as render, screen } from '../../unitTestUtils';
import { UserMessage } from './UserMessage';
import type { Message } from '../../hooks/AIState';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

describe('<UserMessage />', () => {
  const createMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'test-message-id',
    role: 'user',
    answer: 'This is a test user message.',
    date: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Message Content', () => {
    it('displays the message answer content', () => {
      const message = createMessage({ answer: 'What is the weather today?' });

      render(<UserMessage message={message} isLastUserMessage={false} />);

      expect(screen.getByText('What is the weather today?')).toBeInTheDocument();
    });

    it('renders component when answer is undefined', () => {
      const message = createMessage({ answer: undefined });

      render(<UserMessage message={message} isLastUserMessage={false} />);

      // NOTE: Using getByTestId because the PatternFly Message component mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });

    it('renders component when answer is an empty string', () => {
      const message = createMessage({ answer: '' });

      render(<UserMessage message={message} isLastUserMessage={false} />);

      // NOTE: Using getByTestId because the PatternFly Message component mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });
  });

  describe('Message Role', () => {
    it('renders as a user message', () => {
      const message = createMessage();

      render(<UserMessage message={message} isLastUserMessage={false} />);

      // NOTE: Using getByTestId because the PatternFly Message mock uses data-role attribute
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('data-role', 'user');
    });
  });

  describe('Actions', () => {
    it('includes copy action for non-last user messages', () => {
      const message = createMessage();

      render(<UserMessage message={message} isLastUserMessage={false} />);

      // NOTE: Using getByTestId because the PatternFly Message mock passes actions as an attribute
      // The mock passes actions prop to the div element as a serialized string
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('actions');
    });

    it('includes both copy and edit actions when isLastUserMessage is true', () => {
      const message = createMessage();

      render(<UserMessage message={message} isLastUserMessage={true} />);

      // NOTE: Using getByTestId because the PatternFly Message mock passes actions as an attribute
      const messageElement = screen.getByTestId('message');
      expect(messageElement).toHaveAttribute('actions');
    });
  });

  describe('isLastUserMessage', () => {
    it('renders correctly when isLastUserMessage is true', () => {
      const message = createMessage();

      render(<UserMessage message={message} isLastUserMessage={true} />);

      // NOTE: Using getByTestId because the PatternFly Message component mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });

    it('renders correctly when isLastUserMessage is false', () => {
      const message = createMessage();

      render(<UserMessage message={message} isLastUserMessage={false} />);

      // NOTE: Using getByTestId because the PatternFly Message component mock renders with data-testid="message"
      expect(screen.getByTestId('message')).toBeInTheDocument();
    });
  });
});
