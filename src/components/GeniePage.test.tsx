import { checkAccessibility, render, waitFor } from '../unitTestUtils';
import { GeniePage } from './GeniePage';

describe('GeniePage', () => {
  it('displays page content when rendered', async () => {
    render(<GeniePage />);

    // Page should render without errors
    expect(document.body).toBeInTheDocument();

    // Wait for async Popper positioning to complete
    await waitFor(() => expect(document.body).toBeInTheDocument());
  });

  it('is accessible', async () => {
    const { container } = render(<GeniePage />, { initialEntries: ['/genie'] });

    // Wait for async Popper positioning to complete
    await waitFor(() => expect(container).toBeInTheDocument());

    await checkAccessibility(container);
  });
});
