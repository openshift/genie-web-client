import { render, screen } from '@testing-library/react';
import { Layout } from '../Layout';
import { DrawerProvider } from '../../global-drawer';

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

// Stub out MessageBar so it doesn't render (but remains a valid component)
jest.mock('@patternfly/chatbot', () => ({
  MessageBar: () => null,
}));

describe('Layout empty state', () => {
  const renderWithProviders = () =>
    render(
      <DrawerProvider>
        <Layout />
      </DrawerProvider>,
    );

  it('renders heading without username when none stored', () => {
    renderWithProviders();
    expect(
      screen.getByRole('heading', {
        name: /every dashboard tells a story\. what will yours say\?/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders description and CTA', () => {
    renderWithProviders();

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
