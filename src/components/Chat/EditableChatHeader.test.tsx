import { render, screen, user } from '../../unitTestUtils';
import { EditableChatHeader } from './EditableChatHeader';

describe('EditableChatHeader', () => {
  const renderHeader = () => render(<EditableChatHeader />);

  it('renders initial title and actions', async () => {
    renderHeader();
    expect(screen.getByText('Chat title')).toBeInTheDocument();
  });

  it('enters edit mode on title click and hides actions', async () => {
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    // Input appears
    expect(screen.getByRole('textbox', { name: 'Edit conversation title' })).toBeInTheDocument();
    // Actions hidden while editing
    expect(screen.queryByRole('button', { name: 'kebab dropdown toggle' })).not.toBeInTheDocument();
  });

  it('cancel discards edits and restores original title', async () => {
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    const input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'New header title');
    await user.click(screen.getByRole('button', { name: 'Cancel title edit' }));
    expect(screen.getByText('Chat title')).toBeInTheDocument();
  });

  it('save commits the edited title (button and Enter key)', async () => {
    renderHeader();
    // Save via button
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    let input = screen.getByRole('textbox', {
      name: 'Edit conversation title',
    }) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'Saved title');
    await user.click(screen.getByRole('button', { name: 'Save title' }));
    expect(screen.getByText('Saved title')).toBeInTheDocument();

    // Save via Enter
    await user.click(screen.getByRole('button', { name: 'Edit conversation title' }));
    input = screen.getByRole('textbox', { name: 'Edit conversation title' }) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'Enter saved');
    await user.keyboard('{Enter}');
    expect(screen.getByText('Enter saved')).toBeInTheDocument();
  });
});
