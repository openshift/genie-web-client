import { render, screen } from '../../unitTestUtils';
import Home from './Home';

// Mock i18n to return predictable strings used in assertions
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      switch (key) {
        case 'dashboard.emptyState.headingNoName':
          return 'Every dashboard tells a story. What will yours say?';
        case 'dashboard.emptyState.description':
          return 'Begin with Genie — transform your OpenShift data into insight, and insight into action.';
        case 'dashboard.emptyState.cta':
          return 'Create your first dashboard';
        default:
          return key;
      }
    },
  }),
}));

describe('Home empty state', () => {
  const renderHome = () => render(<Home />);

  it('renders heading without username when none stored', () => {
    renderHome();
    expect(
      screen.getByRole('heading', {
        name: /every dashboard tells a story\. what will yours say\?/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders description and CTA', () => {
    renderHome();

    expect(
      screen.getByText(
        /Begin with Genie — transform your OpenShift data into insight, and insight into action\./i,
      ),
    ).toBeInTheDocument();

    const cta = screen.getByRole('button', { name: /create your first dashboard/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toBeEnabled();
  });
});
