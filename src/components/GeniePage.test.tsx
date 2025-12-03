import { checkAccessibility, render } from '../unitTestUtils';
import GeniePage from './GeniePage';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('GeniePage', () => {
  it('renders without crashing', () => {
    render(<GeniePage />);
  });

  it('is accessible', async () => {
    const { container } = render(<GeniePage />, { initialEntries: ['/genie'] });
    await checkAccessibility(container);
  });
});
