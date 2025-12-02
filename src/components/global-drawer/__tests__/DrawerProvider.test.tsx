import { render, screen, waitFor, user, checkAccessibility } from '../../../unitTestUtils';

import { DrawerProvider } from '../DrawerProvider';
import { useDrawer } from '../DrawerContext';

// Test component that uses the drawer
const TestComponent = () => {
  const { drawerState, openDrawer, closeDrawer } = useDrawer();

  const handleOpenLeft = () => {
    openDrawer({
      heading: 'Left Drawer',
      icon: <span data-testid="left-icon">🔧</span>,
      children: <div>Left drawer content</div>,
      position: 'left',
    });
  };

  const handleOpenRight = () => {
    openDrawer({
      heading: 'Right Drawer',
      icon: <span data-testid="right-icon">📄</span>,
      children: <div>Right drawer content</div>,
      position: 'right',
    });
  };

  const handleOpenDefault = () => {
    openDrawer({
      heading: 'Default Drawer',
      icon: <span data-testid="default-icon">📋</span>,
      children: <div>Default drawer content</div>,
    });
  };

  const handleOpenWithCallback = () => {
    openDrawer({
      heading: 'Drawer with Callback',
      icon: <span data-testid="callback-icon">🔔</span>,
      children: <div>Drawer with callback content</div>,
      onClose: () => {
        console.log('Custom close callback called');
      },
    });
  };

  return (
    <div>
      <button onClick={handleOpenLeft}>Open Left</button>
      <button onClick={handleOpenRight}>Open Right</button>
      <button onClick={handleOpenDefault}>Open Default</button>
      <button onClick={handleOpenWithCallback}>Open With Callback</button>
      <button onClick={closeDrawer}>Close Drawer</button>
      <div>Test Component Content</div>
      <div data-testid="drawer-state">
        <span data-testid="drawer-is-open">{String(drawerState.isOpen)}</span>
        <span data-testid="drawer-position">{drawerState.position}</span>
        <div data-testid="drawer-heading">{drawerState.heading}</div>
        <div data-testid="drawer-children">{drawerState.children}</div>
      </div>
    </div>
  );
};

describe('DrawerProvider', () => {
  it('renders children correctly', () => {
    render(
      <DrawerProvider>
        <div>Test Content</div>
      </DrawerProvider>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );
    await checkAccessibility(container);
  });

  it('opens drawer with correct config when openDrawer is called', async () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    const openButton = screen.getByText('Open Right');
    await user.click(openButton);

    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('true');
    expect(screen.getByTestId('drawer-position')).toHaveTextContent('right');
    expect(screen.getByTestId('drawer-heading')).toHaveTextContent('Right Drawer');
    expect(screen.getByTestId('drawer-children')).toHaveTextContent('Right drawer content');
  });

  it('closes drawer when closeDrawer is called', async () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    // Open drawer
    await user.click(screen.getByText('Open Right'));
    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('true');

    // Close drawer
    await user.click(screen.getByText('Close Drawer'));

    await waitFor(() => {
      // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
      expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('false');
    });
  });

  it('defaults position to right when not specified', async () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Default'));

    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('true');
    expect(screen.getByTestId('drawer-position')).toHaveTextContent('right');
    expect(screen.getByTestId('drawer-heading')).toHaveTextContent('Default Drawer');
  });

  it('handles left position correctly', async () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Left'));

    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('true');
    expect(screen.getByTestId('drawer-position')).toHaveTextContent('left');
    expect(screen.getByTestId('drawer-heading')).toHaveTextContent('Left Drawer');
    expect(screen.getByTestId('drawer-children')).toHaveTextContent('Left drawer content');
  });

  it('invokes custom onClose callback when drawer is closed', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    // Open drawer with callback
    await user.click(screen.getByText('Open With Callback'));
    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('true');

    // Close drawer
    await user.click(screen.getByText('Close Drawer'));

    expect(consoleSpy).toHaveBeenCalledWith('Custom close callback called');
    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('false');

    consoleSpy.mockRestore();
  });

  it('updates drawer content when openDrawer is called multiple times', async () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    // Open first drawer
    await user.click(screen.getByText('Open Left'));
    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-heading')).toHaveTextContent('Left Drawer');
    expect(screen.getByTestId('drawer-position')).toHaveTextContent('left');

    // Open second drawer (should replace first)
    await user.click(screen.getByText('Open Right'));
    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-heading')).toHaveTextContent('Right Drawer');
    expect(screen.getByTestId('drawer-position')).toHaveTextContent('right');
  });

  it('maintains drawer state through multiple open/close cycles', async () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    // First cycle
    await user.click(screen.getByText('Open Right'));
    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('true');
    expect(screen.getByTestId('drawer-heading')).toHaveTextContent('Right Drawer');

    await user.click(screen.getByText('Close Drawer'));
    await waitFor(() => {
      // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
      expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('false');
    });

    // Second cycle
    await user.click(screen.getByText('Open Left'));
    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('true');
    expect(screen.getByTestId('drawer-heading')).toHaveTextContent('Left Drawer');

    await user.click(screen.getByText('Close Drawer'));
    await waitFor(() => {
      // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
      expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('false');
    });
  });

  it('stores all drawer config properties correctly in state', async () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Right'));

    // Check all parts are in state
    // TODO: Change from getByTestId to getByRole or other more specific query (see: https://testing-library.com/docs/queries/about/#priority)
    expect(screen.getByTestId('drawer-is-open')).toHaveTextContent('true');
    expect(screen.getByTestId('drawer-position')).toHaveTextContent('right');
    expect(screen.getByTestId('drawer-heading')).toHaveTextContent('Right Drawer');
    expect(screen.getByTestId('drawer-children')).toHaveTextContent('Right drawer content');
  });
});
