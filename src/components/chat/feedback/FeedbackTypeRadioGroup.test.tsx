import { render, screen, user } from '../../../unitTestUtils';
import { FeedbackTypeRadioGroup } from './FeedbackTypeRadioGroup';

describe('<FeedbackTypeRadioGroup />', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all feedback type options', () => {
    render(<FeedbackTypeRadioGroup onValueChange={mockOnValueChange} />);

    expect(screen.getByRole('radio', { name: /Incorrect/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Unhelpful/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Incomplete/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Harmful/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Other/i })).toBeInTheDocument();
  });

  it('displays descriptions for feedback types with descriptions', () => {
    render(<FeedbackTypeRadioGroup onValueChange={mockOnValueChange} />);

    expect(screen.getByText(/Contains factual errors or flawed logic/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Doesn't answer the prompt's intent or is not relevant/i),
    ).toBeInTheDocument();
  });

  it('calls onValueChange when radio button is clicked', async () => {
    render(<FeedbackTypeRadioGroup onValueChange={mockOnValueChange} />);

    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));

    expect(mockOnValueChange).toHaveBeenCalledWith('incorrect');
  });

  it('checks the correct radio button when selectedValue is provided', () => {
    render(
      <FeedbackTypeRadioGroup selectedValue="not_relevant" onValueChange={mockOnValueChange} />,
    );

    expect(screen.getByRole('radio', { name: /Unhelpful/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Incorrect/i })).not.toBeChecked();
  });

  it('disables all radio buttons when isDisabled is true', () => {
    render(<FeedbackTypeRadioGroup onValueChange={mockOnValueChange} isDisabled={true} />);

    expect(screen.getByRole('radio', { name: /Incorrect/i })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Unhelpful/i })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Incomplete/i })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Harmful/i })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Other/i })).toBeDisabled();
  });

  it('enables all radio buttons when isDisabled is false', () => {
    render(<FeedbackTypeRadioGroup onValueChange={mockOnValueChange} isDisabled={false} />);

    expect(screen.getByRole('radio', { name: /Incorrect/i })).toBeEnabled();
    expect(screen.getByRole('radio', { name: /Unhelpful/i })).toBeEnabled();
  });

  it('marks radiogroup as required', () => {
    render(<FeedbackTypeRadioGroup onValueChange={mockOnValueChange} />);

    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-required', 'true');
  });

  it('calls onValueChange with different feedback types', async () => {
    render(<FeedbackTypeRadioGroup onValueChange={mockOnValueChange} />);

    await user.click(screen.getByRole('radio', { name: /Incomplete/i }));
    expect(mockOnValueChange).toHaveBeenCalledWith('incomplete');

    await user.click(screen.getByRole('radio', { name: /Harmful/i }));
    expect(mockOnValueChange).toHaveBeenCalledWith('unsafe');

    await user.click(screen.getByRole('radio', { name: /Other/i }));
    expect(mockOnValueChange).toHaveBeenCalledWith('other');
  });
});
