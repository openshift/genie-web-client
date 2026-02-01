import { render, screen, user, waitFor } from '../../unitTestUtils';
import { EditableChatHeader } from './EditableChatHeader';

// mocked useChatConversation hook for testing
const mockStartEditingTitle = jest.fn();
const mockCancelEditingTitle = jest.fn();
const mockUpdateTitleValue = jest.fn();
const mockSaveTitle = jest.fn();

const mockUseChatConversation = jest.fn();

jest.mock('../../hooks/useChatConversation', () => ({
  useChatConversation: () => mockUseChatConversation(),
}));

describe('EditableChatHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // setup default mock return values for useChatConversation
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: false,
        editValue: 'Chat title',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    mockSaveTitle.mockResolvedValue(undefined);
  });

  const renderHeader = () => render(<EditableChatHeader />);

  it('renders initial title and actions', async () => {
    renderHeader();
    expect(screen.getByText('Chat title')).toBeInTheDocument();
  });

  it('enters edit mode on title click and hides actions', async () => {
    // Set isEditing to true to simulate edit mode
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: true,
        editValue: 'Chat title',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    // input appears
    expect(screen.getByRole('textbox', { name: 'Edit conversation title' })).toBeInTheDocument();
    // actions hidden while editing
    expect(screen.queryByRole('button', { name: 'kebab dropdown toggle' })).not.toBeInTheDocument();
  });

  it('calls startEditingTitle when title button is clicked', async () => {
    renderHeader();
    const editButton = screen.getByRole('button', { name: 'Edit conversation title' });
    await user.click(editButton);

    expect(mockStartEditingTitle).toHaveBeenCalled();
  });

  it('cancel discards edits by calling cancelEditingTitle', async () => {
    // Set isEditing to true to show the cancel button
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: true,
        editValue: 'New header title',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Cancel title edit' }));

    expect(mockCancelEditingTitle).toHaveBeenCalled();
  });

  it('keeps draft title when active conversation updates during edit', async () => {
    // Initial state with editing mode
    mockUseChatConversation.mockReturnValue({
      title: 'Original title',
      titleEditState: {
        isEditing: true,
        editValue: 'Draft title',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    const { rerender } = render(<EditableChatHeader />);

    // Simulate server update while editing - the editValue should stay the same
    mockUseChatConversation.mockReturnValue({
      title: 'Server updated title',
      titleEditState: {
        isEditing: true,
        editValue: 'Draft title', // This should persist during edit
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    rerender(<EditableChatHeader />);

    expect(screen.getByRole('textbox', { name: 'Edit conversation title' })).toHaveValue(
      'Draft title',
    );
  });

  it('save commits the edited title via button and calls saveTitle', async () => {
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: true,
        editValue: 'Saved title',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Save title' }));

    await waitFor(() => {
      expect(mockSaveTitle).toHaveBeenCalled();
    });
  });

  it('save commits the edited title via Enter key and calls saveTitle', async () => {
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: true,
        editValue: 'Enter saved',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    input.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockSaveTitle).toHaveBeenCalled();
    });
  });

  it('displays fallback title when title is null', () => {
    mockUseChatConversation.mockReturnValue({
      title: null,
      titleEditState: {
        isEditing: false,
        editValue: '',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    expect(screen.getByText('New conversation')).toBeInTheDocument();
  });

  it('displays fallback title when title is empty string', () => {
    mockUseChatConversation.mockReturnValue({
      title: '',
      titleEditState: {
        isEditing: false,
        editValue: '',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    expect(screen.getByText('New conversation')).toBeInTheDocument();
  });

  it('shows loading state while updating title', async () => {
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: true,
        editValue: 'Saving title',
        validationError: undefined,
        apiError: null,
        isUpdating: true,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();

    // buttons disabled while updating
    expect(screen.getByRole('button', { name: 'Save title' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel title edit' })).toBeDisabled();
  });

  it('displays error alert when API update fails', async () => {
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: false,
        editValue: 'Chat title',
        validationError: undefined,
        apiError: 'Network error occurred',
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    expect(screen.getByText('Failed to update conversation title')).toBeInTheDocument();
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('calls updateTitleValue when input changes', async () => {
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: true,
        editValue: '',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    await user.type(input, 'a');

    expect(mockUpdateTitleValue).toHaveBeenCalledWith('a');
  });

  it('shows validation error in tooltip', async () => {
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: true,
        editValue: '',
        validationError: 'Title cannot be empty',
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    expect(screen.getByText('Title cannot be empty')).toBeInTheDocument();
  });

  it('supports Escape key to cancel editing', async () => {
    mockUseChatConversation.mockReturnValue({
      title: 'Chat title',
      titleEditState: {
        isEditing: true,
        editValue: 'Changed title',
        validationError: undefined,
        apiError: null,
        isUpdating: false,
      },
      startEditingTitle: mockStartEditingTitle,
      cancelEditingTitle: mockCancelEditingTitle,
      updateTitleValue: mockUpdateTitleValue,
      saveTitle: mockSaveTitle,
    });

    renderHeader();
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;

    input.focus();
    await user.keyboard('{Escape}');

    expect(mockCancelEditingTitle).toHaveBeenCalled();
  });
});
