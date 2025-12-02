import { MemoryRouter } from 'react-router-dom-v5-compat';
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
    render(
      <MemoryRouter
        initialEntries={['/genie']}
        // future props are needed to prevent warnings about react router v7 compatibility in the console
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <GeniePage />
      </MemoryRouter>,
    );
  });

  it('is accessible', async () => {
    const { container } = render(
      <MemoryRouter
        initialEntries={['/genie']}
        // future props are needed to prevent warnings about react router v7 compatibility in the console
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <GeniePage />
      </MemoryRouter>,
    );
    await checkAccessibility(container);
  });
});
