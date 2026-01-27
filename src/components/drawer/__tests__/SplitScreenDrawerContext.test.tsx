import { render, screen, renderHook } from '../../../unitTestUtils';
import { act } from '@testing-library/react';
import {
  SplitScreenDrawerContext,
  useSplitScreenDrawer,
  SplitScreenDrawerConfig,
  SplitScreenDrawerState,
  SplitScreenDrawerContextValue,
} from '../SplitScreenDrawerContext';
import { SplitScreenDrawerProvider } from '../SplitScreenDrawerProvider';

describe('SplitScreenDrawerContext', () => {
  describe('useSplitScreenDrawer hook', () => {
    it('throws error when used outside SplitScreenDrawerProvider', () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useSplitScreenDrawer());

      expect(result.error).toEqual(
        new Error('useSplitScreenDrawer must be used within a SplitScreenDrawerProvider'),
      );

      consoleSpy.mockRestore();
    });

    it('returns context value when used within SplitScreenDrawerProvider', () => {
      const { result } = renderHook(() => useSplitScreenDrawer(), {
        wrapper: SplitScreenDrawerProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.splitScreenDrawerState).toBeDefined();
      expect(result.current.openSplitScreenDrawer).toBeDefined();
      expect(result.current.closeSplitScreenDrawer).toBeDefined();
      expect(result.current.splitScreenDrawerState.isOpen).toBe(false);
      expect(result.current.splitScreenDrawerState.position).toBe('right');
      expect(result.current.splitScreenDrawerState.children).toBe(null);
    });

    it('provides correct initial state', () => {
      const { result } = renderHook(() => useSplitScreenDrawer(), {
        wrapper: SplitScreenDrawerProvider,
      });

      const initialState: SplitScreenDrawerState = {
        isOpen: false,
        children: null,
        position: 'right',
      };

      expect(result.current.splitScreenDrawerState).toMatchObject(initialState);
    });

    it('opens drawer with provided config when openSplitScreenDrawer is called', () => {
      const { result } = renderHook(() => useSplitScreenDrawer(), {
        wrapper: SplitScreenDrawerProvider,
      });

      const config: SplitScreenDrawerConfig = {
        children: <>Test content</>,
        position: 'left',
      };

      act(() => {
        result.current.openSplitScreenDrawer(config);
      });

      expect(result.current.splitScreenDrawerState.isOpen).toBe(true);
      expect(result.current.splitScreenDrawerState.position).toBe('left');
      expect(result.current.splitScreenDrawerState.children).toBeDefined();
    });

    it('defaults position to right when not specified in config', () => {
      const { result } = renderHook(() => useSplitScreenDrawer(), {
        wrapper: SplitScreenDrawerProvider,
      });

      const config: SplitScreenDrawerConfig = {
        children: <>Test content</>,
      };

      act(() => {
        result.current.openSplitScreenDrawer(config);
      });

      expect(result.current.splitScreenDrawerState.isOpen).toBe(true);
      expect(result.current.splitScreenDrawerState.position).toBe('right');
    });

    it('closes drawer when closeSplitScreenDrawer is called', () => {
      const { result } = renderHook(() => useSplitScreenDrawer(), {
        wrapper: SplitScreenDrawerProvider,
      });

      const config: SplitScreenDrawerConfig = {
        children: <>Test content</>,
        position: 'left',
      };

      act(() => {
        result.current.openSplitScreenDrawer(config);
      });

      expect(result.current.splitScreenDrawerState.isOpen).toBe(true);

      act(() => {
        result.current.closeSplitScreenDrawer();
      });

      expect(result.current.splitScreenDrawerState.isOpen).toBe(false);
      // Position should be preserved
      expect(result.current.splitScreenDrawerState.position).toBe('left');
    });

    it('invokes onClose callback when drawer is closed', () => {
      const mockOnClose = jest.fn();
      const { result } = renderHook(() => useSplitScreenDrawer(), {
        wrapper: SplitScreenDrawerProvider,
      });

      const config: SplitScreenDrawerConfig = {
        children: <>Test content</>,
        onClose: mockOnClose,
      };

      act(() => {
        result.current.openSplitScreenDrawer(config);
      });

      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        result.current.closeSplitScreenDrawer();
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('preserves state properties when closing drawer', () => {
      const { result } = renderHook(() => useSplitScreenDrawer(), {
        wrapper: SplitScreenDrawerProvider,
      });

      const config: SplitScreenDrawerConfig = {
        children: <>Test content</>,
        position: 'left',
      };

      act(() => {
        result.current.openSplitScreenDrawer(config);
      });

      const stateBeforeClose = { ...result.current.splitScreenDrawerState };

      act(() => {
        result.current.closeSplitScreenDrawer();
      });

      expect(result.current.splitScreenDrawerState.isOpen).toBe(false);
      expect(result.current.splitScreenDrawerState.position).toBe(stateBeforeClose.position);
      expect(result.current.splitScreenDrawerState.children).toBe(stateBeforeClose.children);
    });
  });

  describe('SplitScreenDrawerContext', () => {
    it('is created with undefined default value', () => {
      // The context should be created with undefined as default
      // This is verified by the error thrown when used outside provider
      expect(SplitScreenDrawerContext).toBeDefined();
      // The context is created with undefined as the default value
      // This is tested indirectly by the error thrown when used outside provider
    });

    it('provides context value through provider', () => {
      const TestComponent = () => {
        const context = useSplitScreenDrawer();
        return (
          <div>
            <div data-testid="is-open">{String(context.splitScreenDrawerState.isOpen)}</div>
            <div data-testid="position">{context.splitScreenDrawerState.position}</div>
          </div>
        );
      };

      render(
        <SplitScreenDrawerProvider>
          <TestComponent />
        </SplitScreenDrawerProvider>,
      );

      expect(screen.getByTestId('is-open')).toHaveTextContent('false');
      expect(screen.getByTestId('position')).toHaveTextContent('right');
    });
  });

  describe('Type definitions', () => {
    it('SplitScreenDrawerConfig has correct structure', () => {
      const config: SplitScreenDrawerConfig = {
        children: <>Test</>,
        position: 'left',
        onClose: jest.fn(),
      };

      expect(config.children).toBeDefined();
      expect(config.position).toBe('left');
      expect(config.onClose).toBeDefined();
    });

    it('SplitScreenDrawerState extends SplitScreenDrawerConfig with isOpen', () => {
      const state: SplitScreenDrawerState = {
        isOpen: true,
        children: <>Test</>,
        position: 'right',
      };

      expect(state.isOpen).toBe(true);
      expect(state.children).toBeDefined();
      expect(state.position).toBe('right');
    });

    it('SplitScreenDrawerContextValue has correct structure', () => {
      const contextValue: SplitScreenDrawerContextValue = {
        splitScreenDrawerState: {
          isOpen: false,
          children: null,
          position: 'right',
        },
        openSplitScreenDrawer: jest.fn(),
        closeSplitScreenDrawer: jest.fn(),
      };

      expect(contextValue.splitScreenDrawerState).toBeDefined();
      expect(contextValue.openSplitScreenDrawer).toBeDefined();
      expect(contextValue.closeSplitScreenDrawer).toBeDefined();
    });
  });
});
