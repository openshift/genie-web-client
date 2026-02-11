import { render, screen } from '../../../unitTestUtils';
import { FeedbackAlert } from './FeedbackAlert';
import { AlertVariant } from '@patternfly/react-core';

describe('<FeedbackAlert />', () => {
  it('renders alert with title', () => {
    render(<FeedbackAlert variant={AlertVariant.danger} title="Error occurred" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('renders alert with children content', () => {
    render(
      <FeedbackAlert variant={AlertVariant.danger} title="Error occurred">
        Additional error details
      </FeedbackAlert>,
    );

    expect(screen.getByText('Additional error details')).toBeInTheDocument();
  });

  it('renders alert without children', () => {
    render(<FeedbackAlert variant={AlertVariant.danger} title="Error occurred" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('applies danger variant', () => {
    render(<FeedbackAlert variant={AlertVariant.danger} title="Error occurred" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('pf-m-danger');
  });

  it('applies success variant', () => {
    render(<FeedbackAlert variant={AlertVariant.success} title="Success" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('pf-m-success');
  });

  it('applies inline style', () => {
    render(<FeedbackAlert variant={AlertVariant.danger} title="Error occurred" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('pf-m-inline');
  });

  it('applies margin bottom class', () => {
    render(<FeedbackAlert variant={AlertVariant.danger} title="Error occurred" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('pf-v6-u-mb-lg');
  });
});
