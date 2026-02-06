import { ReactElement } from 'react';
import { render, RenderOptions, RouterOptions } from '../../unitTestUtils';
import { DrawerProvider } from './DrawerProvider';
import { DrawerContextValue } from './DrawerContext';

/**
 * Creates a mock drawer context for unit testing components that use useDrawer.
 *
 * This is useful when you want to test a component in isolation without rendering
 * the full DrawerProvider.
 *
 * @example
 * const mockDrawer = createMockDrawerContext();
 * jest.mock('./global-drawer', () => ({
 *   useDrawer: () => mockDrawer,
 * }));
 *
 * // In your test
 * render(<YourComponent />);
 * expect(mockDrawer.openDrawer).toHaveBeenCalled();
 */
export const createMockDrawerContext = (): DrawerContextValue =>
  ({
    drawerState: {
      isOpen: false,
      heading: null,
      icon: null,
      children: null,
      position: 'right',
    },
    openDrawer: jest.fn(),
    closeDrawer: jest.fn(),
  } as unknown as DrawerContextValue);

/**
 * Renders a component wrapped with DrawerProvider for integration testing.
 * Use this when you want to test the full drawer functionality including
 * opening, closing, and rendering drawer content.
 *
 * @example
 * const { getByText, user } = renderWithDrawerProvider(<YourComponent />);
 * await user.click(getByText('Open Drawer'));
 * expect(getByText('Drawer Content')).toBeInTheDocument();
 */
export const renderWithDrawerProvider = (
  ui: ReactElement,
  routerOptions: RouterOptions = {},
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return render(<DrawerProvider>{ui}</DrawerProvider>, routerOptions, options);
};
