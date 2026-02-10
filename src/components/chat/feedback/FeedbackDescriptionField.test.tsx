import { render, screen, user } from '../../../unitTestUtils';
import { FeedbackDescriptionField } from './FeedbackDescriptionField';

describe('<FeedbackDescriptionField />', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea with placeholder', () => {
    render(<FeedbackDescriptionField value="" onValueChange={mockOnValueChange} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute(
      'placeholder',
      'Explain why this response is problematic.  Your detailed feedback is valuable for our review.',
    );
  });

  it('displays Optional label', () => {
    render(<FeedbackDescriptionField value="" onValueChange={mockOnValueChange} />);

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('displays current value in textarea', () => {
    render(<FeedbackDescriptionField value="Test feedback" onValueChange={mockOnValueChange} />);

    expect(screen.getByRole('textbox')).toHaveValue('Test feedback');
  });

  it('calls onValueChange when text is typed', async () => {
    render(<FeedbackDescriptionField value="" onValueChange={mockOnValueChange} />);

    await user.type(screen.getByRole('textbox'), 'New feedback');

    expect(mockOnValueChange).toHaveBeenCalled();
    expect(mockOnValueChange).toHaveBeenCalledWith('N');
    expect(mockOnValueChange).toHaveBeenCalledWith('e');
  });

  it('disables textarea when isDisabled is true', () => {
    render(
      <FeedbackDescriptionField value="" onValueChange={mockOnValueChange} isDisabled={true} />,
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('enables textarea when isDisabled is false', () => {
    render(
      <FeedbackDescriptionField value="" onValueChange={mockOnValueChange} isDisabled={false} />,
    );

    expect(screen.getByRole('textbox')).toBeEnabled();
  });

  it('sets textarea to readonly when isReadOnly is true', () => {
    render(
      <FeedbackDescriptionField value="" onValueChange={mockOnValueChange} isReadOnly={true} />,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('allows editing when isReadOnly is false', () => {
    render(
      <FeedbackDescriptionField value="" onValueChange={mockOnValueChange} isReadOnly={false} />,
    );

    expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
  });

  it('has vertical resize orientation', () => {
    render(<FeedbackDescriptionField value="" onValueChange={mockOnValueChange} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea.parentElement).toHaveClass('pf-m-resize-vertical');
  });

  it('has max length of 2500 characters', () => {
    render(<FeedbackDescriptionField value="" onValueChange={mockOnValueChange} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '2500');
  });

  it('displays field label', () => {
    render(<FeedbackDescriptionField value="" onValueChange={mockOnValueChange} />);

    expect(screen.getByText('Please provide a brief description of the issue')).toBeInTheDocument();
  });
});
