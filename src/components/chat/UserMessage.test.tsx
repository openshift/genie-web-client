import {
  renderWithoutProviders as render,
  screen,
  user,
  checkAccessibility,
} from '../../unitTestUtils';
import { UserMessage } from './UserMessage';
import type { Message } from '../../hooks/AIState';

const mockUseInProgress = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useInProgress: () => mockUseInProgress(),
}));

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
    mockUseInProgress.mockReturnValue(false);
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

  describe('Accessibility', () => {
    it('has no accessibility violations when rendered', async () => {
      const message = createMessage();

      const { container } = render(<UserMessage message={message} isLastUserMessage={false} />);

      await checkAccessibility(container);
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

    it('does not open edit controls when response is in progress', async () => {
      const message = createMessage();
      mockUseInProgress.mockReturnValue(true);

      render(<UserMessage message={message} isLastUserMessage={true} />);

      await user.click(screen.getByLabelText('Edit'));

      expect(screen.queryByLabelText('Edit message')).not.toBeInTheDocument();
    });

    it('shows edit controls when edit action is clicked', async () => {
      const message = createMessage();

      render(<UserMessage message={message} isLastUserMessage={true} />);

      await user.click(screen.getByLabelText('Edit'));

      expect(screen.getByLabelText('Edit message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('calls onEditMessage when update is clicked with changes', async () => {
      const message = createMessage({ answer: 'Original text' });
      const onEditMessage = jest.fn();

      render(
        <UserMessage message={message} isLastUserMessage={true} onEditMessage={onEditMessage} />,
      );

      await user.click(screen.getByLabelText('Edit'));

      const editTextArea = screen.getByLabelText('Edit message');
      await user.clear(editTextArea);
      await user.type(editTextArea, 'Updated text');

      await user.click(screen.getByRole('button', { name: 'Update' }));

      expect(onEditMessage).toHaveBeenCalledWith('Updated text');
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
