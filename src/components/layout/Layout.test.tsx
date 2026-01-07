import { AIStateProvider } from '@redhat-cloud-services/ai-react-state';
import { render, screen } from '../../unitTestUtils';
import { stateManager } from '../utils/aiStateManager';
import { Layout } from './Layout';
import { DrawerProvider } from '../drawer';

describe('Layout', () => {
  const renderWithProviders = (initialRoute = '/genie') =>
    render(
      <AIStateProvider stateManager={stateManager}>
        <DrawerProvider>
          <Layout />
        </DrawerProvider>
      </AIStateProvider>,
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
