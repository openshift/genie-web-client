import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DrawerProvider } from '../DrawerProvider';
import { useDrawer } from '../DrawerContext';

// Test component that uses the drawer
const TestComponent = () => {
  const { openDrawer, closeDrawer } = useDrawer();

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
    </div>
  );
};

describe('DrawerProvider', () => {
  it('renders children correctly', () => {
    render(
      <DrawerProvider>
        <div>Test Content</div>
      </DrawerProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('opens drawer with correct config when openDrawer is called', async () => {
    const user = userEvent.setup();
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    const openButton = screen.getByText('Open Right');
    await user.click(openButton);

    expect(screen.getByText('Right Drawer')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('Right drawer content')).toBeInTheDocument();
  });

  it('closes drawer when closeDrawer is called', async () => {
    const user = userEvent.setup();
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    // Open drawer
    await user.click(screen.getByText('Open Right'));
    expect(screen.getByText('Right Drawer')).toBeInTheDocument();

    // Close drawer
    await user.click(screen.getByText('Close Drawer'));

    await waitFor(() => {
      expect(screen.queryByText('Right Drawer')).not.toBeInTheDocument();
    });
  });

  it('defaults position to right when not specified', async () => {
    const user = userEvent.setup();
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    await user.click(screen.getByText('Open Default'));

    expect(screen.getByText('Default Drawer')).toBeInTheDocument();
    expect(screen.getByTestId('default-icon')).toBeInTheDocument();
  });

  it('handles left position correctly', async () => {
    const user = userEvent.setup();
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    await user.click(screen.getByText('Open Left'));

    expect(screen.getByText('Left Drawer')).toBeInTheDocument();
    expect(screen.getByText('Left drawer content')).toBeInTheDocument();
  });

  it('invokes custom onClose callback when drawer is closed', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    // Open drawer with callback
    await user.click(screen.getByText('Open With Callback'));
    expect(screen.getByText('Drawer with Callback')).toBeInTheDocument();

    // Close drawer
    await user.click(screen.getByText('Close Drawer'));

    expect(consoleSpy).toHaveBeenCalledWith('Custom close callback called');

    consoleSpy.mockRestore();
  });

  it('updates drawer content when openDrawer is called multiple times', async () => {
    const user = userEvent.setup();
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    // Open first drawer
    await user.click(screen.getByText('Open Left'));
    expect(screen.getByText('Left Drawer')).toBeInTheDocument();
    expect(screen.getByText('Left drawer content')).toBeInTheDocument();

    // Open second drawer (should replace first)
    await user.click(screen.getByText('Open Right'));
    expect(screen.getByText('Right Drawer')).toBeInTheDocument();
    expect(screen.getByText('Right drawer content')).toBeInTheDocument();
    expect(screen.queryByText('Left Drawer')).not.toBeInTheDocument();
  });

  it('maintains drawer state through multiple open/close cycles', async () => {
    const user = userEvent.setup();
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    // First cycle
    await user.click(screen.getByText('Open Right'));
    expect(screen.getByText('Right Drawer')).toBeInTheDocument();

    await user.click(screen.getByText('Close Drawer'));
    await waitFor(() => {
      expect(screen.queryByText('Right Drawer')).not.toBeInTheDocument();
    });

    // Second cycle
    await user.click(screen.getByText('Open Left'));
    expect(screen.getByText('Left Drawer')).toBeInTheDocument();

    await user.click(screen.getByText('Close Drawer'));
    await waitFor(() => {
      expect(screen.queryByText('Left Drawer')).not.toBeInTheDocument();
    });
  });

  it('renders all drawer config properties correctly', async () => {
    const user = userEvent.setup();
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    await user.click(screen.getByText('Open Right'));

    // Check all parts are rendered
    expect(screen.getByText('Right Drawer')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('Right drawer content')).toBeInTheDocument();
  });
});

