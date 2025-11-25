import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppEmptyState from '../EmptyState';

describe('AppEmptyState', () => {
  it('renders heading and description', () => {
    render(<AppEmptyState heading="Hello World" description="This is a description." />);

    expect(screen.getByRole('heading', { name: /hello world/i })).toBeInTheDocument();
    expect(screen.getByText(/this is a description/i)).toBeInTheDocument();
  });

  it('renders a primary action button and fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <AppEmptyState
        heading="With Action"
        description="Click the button below."
        primaryAction={{ label: 'Do it', onClick }}
      />,
    );

    const button = screen.getByRole('button', { name: /do it/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render actions when no primaryAction provided', () => {
    render(<AppEmptyState heading="No Action" description="Nothing to click." />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
