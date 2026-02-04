import { renderHook, act } from '../unitTestUtils';
import {
  useChatConversation,
  useChatConversationContext,
  ChatConversationProvider,
} from './useChatConversation';
import type { AladdinDashboard } from '../types/dashboard';
import React from 'react';

// Helper to create a mock AladdinDashboard
const createMockDashboard = (name: string): AladdinDashboard => ({
  apiVersion: 'aladdin.openshift.io/v1alpha1',
  kind: 'AladdinDashboard',
  metadata: {
    name,
    namespace: 'default',
  },
  spec: {
    title: `Test Dashboard ${name}`,
    layout: {
      columns: 12,
      panels: [],
    },
  },
});

describe('useChatConversation', () => {
  describe('canvas state', () => {
    it('initializes with canvas closed', () => {
      const { result } = renderHook(() => useChatConversation());

      expect(result.current.canvasState).toBe('closed');
      expect(result.current.isCanvasOpen).toBe(false);
    });

    it('opens canvas when openCanvas is called', () => {
      const { result } = renderHook(() => useChatConversation());

      act(() => {
        result.current.openCanvas();
      });

      expect(result.current.canvasState).toBe('open');
      expect(result.current.isCanvasOpen).toBe(true);
    });

    it('closes canvas when closeCanvas is called', () => {
      const { result } = renderHook(() => useChatConversation());

      act(() => {
        result.current.openCanvas();
      });

      expect(result.current.isCanvasOpen).toBe(true);

      act(() => {
        result.current.closeCanvas();
      });

      expect(result.current.canvasState).toBe('closed');
      expect(result.current.isCanvasOpen).toBe(false);
    });

    it('maximizes canvas when maximizeCanvas is called', () => {
      const { result } = renderHook(() => useChatConversation());

      act(() => {
        result.current.maximizeCanvas();
      });

      expect(result.current.canvasState).toBe('maximized');
      expect(result.current.isCanvasOpen).toBe(true);
    });

    it('sets canvas state directly with setCanvasState', () => {
      const { result } = renderHook(() => useChatConversation());

      act(() => {
        result.current.setCanvasState('maximized');
      });

      expect(result.current.canvasState).toBe('maximized');

      act(() => {
        result.current.setCanvasState('closed');
      });

      expect(result.current.canvasState).toBe('closed');
    });
  });

  describe('active artifact', () => {
    it('initializes with no active artifact', () => {
      const { result } = renderHook(() => useChatConversation());

      expect(result.current.activeArtifact).toBeNull();
    });

    it('sets active artifact when setActiveArtifact is called', () => {
      const { result } = renderHook(() => useChatConversation());
      const dashboard = createMockDashboard('test-dashboard');

      act(() => {
        result.current.setActiveArtifact(dashboard);
      });

      expect(result.current.activeArtifact).toEqual(dashboard);
    });

    it('clears active artifact when clearActiveArtifact is called', () => {
      const { result } = renderHook(() => useChatConversation());
      const dashboard = createMockDashboard('test-dashboard');

      act(() => {
        result.current.setActiveArtifact(dashboard);
      });

      expect(result.current.activeArtifact).not.toBeNull();

      act(() => {
        result.current.clearActiveArtifact();
      });

      expect(result.current.activeArtifact).toBeNull();
    });
  });

  describe('create mode', () => {
    it('initializes with create mode disabled', () => {
      const { result } = renderHook(() => useChatConversation());

      expect(result.current.isCreateModeEnabled).toBe(false);
    });

    it('enables create mode when enableCreateMode is called', () => {
      const { result } = renderHook(() => useChatConversation());

      act(() => {
        result.current.enableCreateMode();
      });

      expect(result.current.isCreateModeEnabled).toBe(true);
    });

    it('disables create mode when disableCreateMode is called', () => {
      const { result } = renderHook(() => useChatConversation());

      act(() => {
        result.current.enableCreateMode();
      });

      expect(result.current.isCreateModeEnabled).toBe(true);

      act(() => {
        result.current.disableCreateMode();
      });

      expect(result.current.isCreateModeEnabled).toBe(false);
    });

    it('toggles create mode when toggleCreateMode is called', () => {
      const { result } = renderHook(() => useChatConversation());

      expect(result.current.isCreateModeEnabled).toBe(false);

      act(() => {
        result.current.toggleCreateMode();
      });

      expect(result.current.isCreateModeEnabled).toBe(true);

      act(() => {
        result.current.toggleCreateMode();
      });

      expect(result.current.isCreateModeEnabled).toBe(false);
    });
  });

  describe('memoization', () => {
    it('maintains stable function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useChatConversation());

      const firstOpenCanvas = result.current.openCanvas;
      const firstCloseCanvas = result.current.closeCanvas;
      const firstSetActiveArtifact = result.current.setActiveArtifact;

      rerender();

      expect(result.current.openCanvas).toBe(firstOpenCanvas);
      expect(result.current.closeCanvas).toBe(firstCloseCanvas);
      expect(result.current.setActiveArtifact).toBe(firstSetActiveArtifact);
    });
  });
});

describe('useChatConversationContext', () => {
  it('throws error when used outside of ChatConversationProvider', () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

    const { result } = renderHook(() => useChatConversationContext());

    expect(result.error).toEqual(
      Error('useChatConversationContext must be used within a ChatConversationProvider'),
    );

    consoleSpy.mockRestore();
  });

  it('returns context value when used within ChatConversationProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ChatConversationProvider, null, children);

    const { result } = renderHook(() => useChatConversationContext(), { wrapper });

    expect(result.current.canvasState).toBe('closed');
    expect(result.current.activeArtifact).toBeNull();
    expect(result.current.isCreateModeEnabled).toBe(false);
    expect(typeof result.current.openCanvas).toBe('function');
    expect(typeof result.current.setActiveArtifact).toBe('function');
  });
});
