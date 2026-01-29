import { render, screen, user, waitFor } from '../../unitTestUtils';
import { EditableChatHeader } from './EditableChatHeader';

// mocked hooks for testing
const mockUseActiveConversation = jest.fn();
const mockUpdateTitle = jest.fn();
const mockClearError = jest.fn();
const mockUseUpdateConversationTitle = jest.fn();
const mockUseParams = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  ...jest.requireActual('../../hooks/AIState'),
  useActiveConversation: () => mockUseActiveConversation(),
  useUpdateConversationTitle: () => mockUseUpdateConversationTitle(),
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useParams: () => mockUseParams(),
}));

describe('EditableChatHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // setup default mock return values
    mockUseActiveConversation.mockReturnValue({
      id: 'test-conversation-id',
      title: 'Chat title',
      locked: false,
      createdAt: new Date(),
    });

    mockUseUpdateConversationTitle.mockReturnValue({
      updateTitle: mockUpdateTitle,
      isUpdating: false,
      error: null,
      clearError: mockClearError,
    });

    mockUseParams.mockReturnValue({ conversationId: 'test-conversation-id' });
    mockUpdateTitle.mockResolvedValue(undefined);
  });

  const renderHeader = () => render(<EditableChatHeader />);

  it('renders initial title and actions', async () => {
    renderHeader();
    expect(screen.getByText('Chat title')).toBeInTheDocument();
  });

  it('enters edit mode on title click and hides actions', async () => {
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    // input appears
    expect(screen.getByRole('textbox', { name: 'Edit conversation title' })).toBeInTheDocument();
    // actions hidden while editing
    expect(screen.queryByRole('button', { name: 'kebab dropdown toggle' })).not.toBeInTheDocument();
  });

  it('cancel discards edits and restores original title', async () => {
    renderHeader();
    const editButton = screen.getByRole('button', { name: 'Edit conversation title' });
    await user.click(editButton);

    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    // simulate typing
    await user.clear(input);
    await user.type(input, 'New header title');

    await user.click(screen.getByRole('button', { name: 'Cancel title edit' }));
    expect(screen.getByText('Chat title')).toBeInTheDocument();
  });

  it('keeps draft title when active conversation updates during edit', async () => {
    const { rerender } = render(<EditableChatHeader />);
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    await user.clear(input);
    await user.type(input, 'Draft title');

    mockUseActiveConversation.mockReturnValue({
      id: 'test-conversation-id',
      title: 'Server updated title',
      locked: false,
      createdAt: new Date(),
    });

    rerender(<EditableChatHeader />);

    expect(screen.getByRole('textbox', { name: 'Edit conversation title' })).toHaveValue(
      'Draft title',
    );
  });

  it('save commits the edited title via button and calls API', async () => {
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    await user.clear(input);
    await user.type(input, 'Saved title');

    await user.click(screen.getByRole('button', { name: 'Save title' }));

    await waitFor(() => {
      expect(mockUpdateTitle).toHaveBeenCalledWith('test-conversation-id', 'Saved title');
    });
  });

  it('save commits the edited title via Enter key and calls API', async () => {
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    await user.clear(input);
    await user.type(input, 'Enter saved');

    input.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockUpdateTitle).toHaveBeenCalledWith('test-conversation-id', 'Enter saved');
    });
  });

  it('displays fallback title when topic_summary is null', () => {
    mockUseActiveConversation.mockReturnValue({
      id: 'test-conversation-id',
      title: null,
      locked: false,
      createdAt: new Date(),
    });

    renderHeader();
    expect(screen.getByText('New conversation')).toBeInTheDocument();
  });

  it('displays fallback title when conversation has no title', () => {
    mockUseActiveConversation.mockReturnValue({
      id: 'test-conversation-id',
      locked: false,
      createdAt: new Date(),
    });

    renderHeader();
    expect(screen.getByText('New conversation')).toBeInTheDocument();
  });

  it('shows loading state while updating title', async () => {
    mockUseUpdateConversationTitle.mockReturnValue({
      updateTitle: mockUpdateTitle,
      isUpdating: true,
      error: null,
      clearError: mockClearError,
    });

    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));

    // buttons disabled while updating
    expect(screen.getByRole('button', { name: 'Save title' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel title edit' })).toBeDisabled();
  });

  it('displays error alert when API update fails', async () => {
    mockUseUpdateConversationTitle.mockReturnValue({
      updateTitle: mockUpdateTitle,
      isUpdating: false,
      error: 'Network error occurred',
      clearError: mockClearError,
    });

    renderHeader();
    expect(screen.getByText('Failed to update conversation title')).toBeInTheDocument();
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('clears API error when user starts editing again', async () => {
    mockUseUpdateConversationTitle.mockReturnValue({
      updateTitle: mockUpdateTitle,
      isUpdating: false,
      error: 'Previous error',
      clearError: mockClearError,
    });

    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));

    expect(mockClearError).toHaveBeenCalled();
  });

  it('prevents saving empty title with whitespace', async () => {
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    await user.clear(input);
    await user.type(input, '   ');

    await user.click(screen.getByRole('button', { name: 'Save title' }));

    expect(mockUpdateTitle).not.toHaveBeenCalled();
  });

  it('shows an error when conversationId is missing on save', async () => {
    mockUseParams.mockReturnValue({});
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    await user.clear(input);
    await user.type(input, 'Saved title');

    await user.click(screen.getByRole('button', { name: 'Save title' }));

    expect(
      screen.getByText('Unable to save without a conversation ID. Try again after the chat loads.'),
    ).toBeInTheDocument();
    expect(mockUpdateTitle).not.toHaveBeenCalled();
  });

  it('supports Escape key to cancel editing', async () => {
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    await user.clear(input);
    await user.type(input, 'Changed title');

    input.focus();
    await user.keyboard('{Escape}');

    expect(screen.getByText('Chat title')).toBeInTheDocument();
    expect(mockUpdateTitle).not.toHaveBeenCalled();
  });
});
