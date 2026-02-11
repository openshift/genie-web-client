import { render, screen } from '../../../unitTestUtils';
import { FeedbackDisclaimer } from './FeedbackDisclaimer';

describe('<FeedbackDisclaimer />', () => {
  it('renders disclaimer text', () => {
    render(<FeedbackDisclaimer />);

    expect(
      screen.getByText(
        /A human team will review your report and the associated conversation context/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Do not include personal or sensitive information in the description box above/i,
      ),
    ).toBeInTheDocument();
  });
});
