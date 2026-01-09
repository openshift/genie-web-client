import { checkAccessibility, render } from '../unitTestUtils';
import { GeniePage } from './GeniePage';

describe('GeniePage', () => {
  it('displays page content when rendered', () => {
    render(<GeniePage />);

    // Page should render without errors
    expect(document.body).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<GeniePage />, { initialEntries: ['/genie'] });
    await checkAccessibility(container);
  });
});
