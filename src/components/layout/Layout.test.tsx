import { render, screen, user } from '../../unitTestUtils';
import { AIProvider } from '../../hooks/AIState';
import { Layout } from './Layout';
import { DrawerProvider, useDrawer } from '../drawer';
import { ThemeProvider } from '../theme';

describe('Layout', () => {
  const DrawerOpener = () => {
    const { drawerState, openDrawer } = useDrawer();

    return (
      <div>
        <button
          onClick={() =>
            openDrawer({
              heading: 'Drawer heading',
              icon: <>icon</>,
              children: <>Drawer content</>,
              position: 'left',
            })
          }
        >
          Open Drawer
        </button>
        <div>{`Drawer open: ${drawerState.isOpen}`}</div>
      </div>
    );
  };

  const renderWithProviders = (initialRoute = '/genie') =>
    render(
      <ThemeProvider>
        <AIProvider>
          <DrawerProvider>
            <DrawerOpener />
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

  it('closes the drawer when backdrop is clicked', async () => {
    const { container } = renderWithProviders();

    await user.click(screen.getByRole('button', { name: /open drawer/i }));
    expect(screen.getByText('Drawer heading')).toBeInTheDocument();

    const backdrop = container.querySelector('.pf-v6-c-backdrop');
    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop as HTMLElement);
    expect(screen.getByText('Drawer open: false')).toBeInTheDocument();
  });

  it('keeps the drawer open when drawer content is clicked', async () => {
    renderWithProviders();

    await user.click(screen.getByRole('button', { name: /open drawer/i }));
    expect(screen.getByText('Drawer heading')).toBeInTheDocument();

    await user.click(screen.getByText('Drawer content'));
    expect(screen.getByText('Drawer open: true')).toBeInTheDocument();
  });
});
