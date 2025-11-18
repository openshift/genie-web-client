import { render, screen } from '@testing-library/react';
import { useDrawer } from '../DrawerContext';
import { DrawerProvider } from '../DrawerProvider';

// Test component that uses the useDrawer hook
const TestComponent = () => {
  const drawer = useDrawer();

  return (
    <div>
      <span data-testid="has-open-drawer">{typeof drawer.openDrawer}</span>
      <span data-testid="has-close-drawer">{typeof drawer.closeDrawer}</span>
      <span data-testid="has-drawer-state">{typeof drawer.drawerState}</span>
    </div>
  );
};

// Component that calls useDrawer outside of provider
const ComponentOutsideProvider = () => {
  useDrawer();
  return <div>Should not render</div>;
};

describe('DrawerContext', () => {
  describe('useDrawer hook', () => {
    it('throws error when used outside DrawerProvider', () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<ComponentOutsideProvider />);
      }).toThrow('useDrawer must be used within a DrawerProvider');

      consoleSpy.mockRestore();
    });

    it('returns context value when used within DrawerProvider', () => {
      render(
        <DrawerProvider>
          <TestComponent />
        </DrawerProvider>,
      );

      expect(screen.getByTestId('has-open-drawer')).toBeInTheDocument();
      expect(screen.getByTestId('has-close-drawer')).toBeInTheDocument();
      expect(screen.getByTestId('has-drawer-state')).toBeInTheDocument();
    });

    it('provides functions and state with correct types', () => {
      render(
        <DrawerProvider>
          <TestComponent />
        </DrawerProvider>,
      );

      expect(screen.getByTestId('has-open-drawer')).toHaveTextContent('function');
      expect(screen.getByTestId('has-close-drawer')).toHaveTextContent('function');
      expect(screen.getByTestId('has-drawer-state')).toHaveTextContent('object');
    });

    it('provides openDrawer, closeDrawer, and drawerState properties', () => {
      const TestPropertiesComponent = () => {
        const drawer = useDrawer();
        return (
          <div>
            <span data-testid="has-properties">
              {drawer.openDrawer && drawer.closeDrawer && drawer.drawerState ? 'true' : 'false'}
            </span>
          </div>
        );
      };

      render(
        <DrawerProvider>
          <TestPropertiesComponent />
        </DrawerProvider>,
      );

      expect(screen.getByTestId('has-properties')).toHaveTextContent('true');
    });
  });
});
