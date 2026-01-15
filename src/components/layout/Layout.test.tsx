import { render, screen } from '../../unitTestUtils';
import { AIProvider } from '../../hooks/AIState';
import { Layout } from './Layout';
import { DrawerProvider } from '../drawer';
import { ThemeProvider } from '../theme';

describe('Layout', () => {
  const renderWithProviders = (initialRoute = '/genie') =>
    render(
      <ThemeProvider>
        <AIProvider>
          <DrawerProvider>
            <Layout />
          </DrawerProvider>
        </AIProvider>
      </ThemeProvider>,
      { initialEntries: [initialRoute] },
    );

  it('renders without crashing', () => {
    renderWithProviders();
  });

  it('applies active state to Library button when on library route', () => {
    renderWithProviders('/genie/library');
    const libraryButton = screen.getByRole('button', { name: /library/i });
    expect(libraryButton).toHaveClass('pf-m-current');
  });

  it('does not apply active state to Library button when on other routes', () => {
    renderWithProviders('/genie/chat');
    const libraryButton = screen.getByRole('button', { name: /library/i });
    expect(libraryButton).not.toHaveClass('pf-m-current');
  });
});
