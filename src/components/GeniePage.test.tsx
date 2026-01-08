import { checkAccessibility, render } from '../unitTestUtils';
import GeniePage from './GeniePage';

describe('GeniePage', () => {
  it('renders without crashing', () => {
    render(<GeniePage />);
  });

  it('is accessible', async () => {
    const { container } = render(<GeniePage />, { initialEntries: ['/genie'] });
    await checkAccessibility(container);
  });
});
