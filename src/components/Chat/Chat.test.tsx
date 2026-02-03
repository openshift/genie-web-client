import { renderWithoutProviders, screen } from '../../unitTestUtils';
import { Chat } from './Chat';
import type { CanvasState } from '../../hooks/useChatConversation';

// Mock react-router-dom-v5-compat hooks (keep other exports)
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
}));

// Mock @redhat-cloud-services/ai-react-state
const mockSetActiveConversation = jest.fn();
const mockSendStreamMessage = jest.fn();

jest.mock('@redhat-cloud-services/ai-react-state', () => ({
  useSetActiveConversation: () => mockSetActiveConversation,
  useActiveConversation: () => undefined,
  useSendStreamMessage: () => mockSendStreamMessage,
}));

// Mock useChatConversation hook
const mockUseChatConversation = jest.fn();

jest.mock('../../hooks/useChatConversation', () => ({
  useChatConversation: () => mockUseChatConversation(),
}));

// Mock @patternfly/chatbot components
jest.mock('@patternfly/chatbot', () => ({
  Chatbot: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div className={className} data-testid="chatbot">
      {children}
    </div>
  ),
  ChatbotContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chatbot-content">{children}</div>
  ),
  ChatbotDisplayMode: { embedded: 'embedded' },
  ChatbotFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chatbot-footer">{children}</div>
  ),
  MessageBar: ({ onSendMessage }: { onSendMessage: (value: string) => void }) => (
    <input
      data-testid="message-bar"
      onChange={(e) => onSendMessage(e.target.value)}
      placeholder="Send a message"
    />
  ),
}));

// Mock CanvasLayout
jest.mock('../canvas', () => ({
  CanvasLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-layout">{children}</div>
  ),
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

// Mock BadResponseModal
jest.mock('./feedback/BadResponseModal', () => ({
  BadResponseModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  BadResponseModal: () => null,
}));

// Default mock values matching the simplified useChatConversation hook
const defaultMockValues = {
  canvasState: 'closed' as CanvasState,
  isCanvasOpen: false,
  openCanvas: jest.fn(),
  closeCanvas: jest.fn(),
  maximizeCanvas: jest.fn(),
  setCanvasState: jest.fn(),
  isCreateModeEnabled: false,
  enableCreateMode: jest.fn(),
  disableCreateMode: jest.fn(),
  toggleCreateMode: jest.fn(),
};

describe('Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatConversation.mockReturnValue(defaultMockValues);
    mockUseParams.mockReturnValue({});
    mockSetActiveConversation.mockResolvedValue(undefined);
  });

  const renderChat = () => {
    return renderWithoutProviders(<Chat />);
  };

  describe('Initial Render', () => {
    it('renders MessageList when no conversationId in URL', () => {
      mockUseParams.mockReturnValue({});

      renderChat();

      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });

    it('shows loading state when conversationId is present in URL', () => {
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });

      renderChat();

      expect(screen.getByTestId('message-list-loading')).toBeInTheDocument();
    });

    it('renders MessageList after conversation loads successfully', async () => {
      mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });
      mockSetActiveConversation.mockResolvedValue(undefined);

      renderChat();

      expect(await screen.findByTestId('message-list')).toBeInTheDocument();
    });

    it('shows not found state when setActiveConversation fails', async () => {
      mockUseParams.mockReturnValue({ conversationId: 'invalid-conversation-id' });
      mockSetActiveConversation.mockRejectedValue(new Error('Conversation not found'));

      renderChat();

      expect(await screen.findByTestId('message-list-not-found')).toBeInTheDocument();
    });
  });

  describe('Canvas State', () => {
    it('applies canvas-open class when isCanvasOpen is true and canvasState is open', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        isCanvasOpen: true,
        canvasState: 'open',
      });

      const { container } = renderChat();

      expect(container.querySelector('.chat--canvas-open')).toBeInTheDocument();
    });

    it('applies canvas-maximized class when canvasState is maximized', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        isCanvasOpen: true,
        canvasState: 'maximized',
      });

      const { container } = renderChat();

      expect(container.querySelector('.chat--canvas-maximized')).toBeInTheDocument();
    });

    it('does not apply canvas class when isCanvasOpen is false', () => {
      mockUseChatConversation.mockReturnValue({
        ...defaultMockValues,
        isCanvasOpen: false,
        canvasState: 'closed',
      });

      const { container } = renderChat();

      expect(container.querySelector('.chat--canvas-open')).not.toBeInTheDocument();
      expect(container.querySelector('.chat--canvas-maximized')).not.toBeInTheDocument();
    });
  });
});
