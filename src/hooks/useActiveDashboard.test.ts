import { renderHook, act } from '../unitTestUtils';
import { useActiveDashboard } from './useActiveDashboard';
import type { AladdinDashboard } from '../types/dashboard';
import type { WidgetArtifact, NGUIWidget } from '../types/chat';
import type { ToolCallState } from '../utils/toolCallHelpers';

// Mock useChatConversationContext
const mockSetActiveArtifact = jest.fn();
const mockClearActiveArtifact = jest.fn();
const mockOpenCanvas = jest.fn();
const mockCloseCanvas = jest.fn();
const mockSetDashboardSaved = jest.fn();
let mockActiveArtifact: AladdinDashboard | null = null;
let mockIsDashboardSaved = false;

jest.mock('./useChatConversation', () => ({
  useChatConversationContext: () => ({
    activeArtifact: mockActiveArtifact,
    setActiveArtifact: mockSetActiveArtifact,
    clearActiveArtifact: mockClearActiveArtifact,
    openCanvas: mockOpenCanvas,
    closeCanvas: mockCloseCanvas,
    isDashboardSaved: mockIsDashboardSaved,
    setDashboardSaved: mockSetDashboardSaved,
  }),
}));

// Mock useDashboardActions
const mockCreateDashboard = jest.fn();

jest.mock('./useDashboardActions', () => ({
  useDashboardActions: () => ({
    createDashboard: mockCreateDashboard,
  }),
}));

// Helper to create a mock dashboard
const createMockDashboard = (name: string, panels = 0): AladdinDashboard => ({
  apiVersion: 'aladdin.openshift.io/v1alpha1',
  kind: 'AladdinDashboard',
  metadata: {
    name,
    namespace: 'default',
    uid: `uid-${name}`,
  },
  spec: {
    title: `Dashboard ${name}`,
    layout: {
      columns: 12,
      panels: Array.from({ length: panels }, (_, i) => ({
        id: `panel-${i}`,
        title: `Panel ${i}`,
        position: { x: 0, y: i * 3, width: 6, height: 3 },
        component: { type: 'Chart' as const, config: {} },
        dataSource: { toolCalls: [] },
      })),
    },
  },
});

// Helper to create a mock widget artifact
const createMockWidgetArtifact = (id: string, title?: string): WidgetArtifact => ({
  id,
  type: 'widget',
  createdAt: new Date(),
  widget: {
    id: `widget-${id}`,
    type: 'ngui',
    spec: { component: 'TestComponent', data: [] },
    title,
    createdAt: new Date(),
  } as NGUIWidget,
});

// Helper to create mock tool calls
const createMockToolCalls = (count = 1): ToolCallState[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `tc-${i}`,
    name: i === 0 ? 'generate_ui' : 'get_data',
    status: 'success' as const,
    arguments: { query: `test-${i}` },
    result: i === 0 ? '{"component": "Chart"}' : undefined,
  }));

describe('useActiveDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveArtifact = null;
    mockIsDashboardSaved = false;
  });

  describe('activeDashboard', () => {
    it('returns null when no active artifact exists', () => {
      mockActiveArtifact = null;

      const { result } = renderHook(() => useActiveDashboard('default'));

      expect(result.current.activeDashboard).toBeNull();
    });

    it('returns the dashboard when activeArtifact is an AladdinDashboard', () => {
      mockActiveArtifact = createMockDashboard('test-dash');

      const { result } = renderHook(() => useActiveDashboard('default'));

      expect(result.current.activeDashboard).toEqual(mockActiveArtifact);
    });

    it('returns null when activeArtifact is not an AladdinDashboard', () => {
      mockActiveArtifact = { type: 'code', id: 'test' } as unknown as AladdinDashboard;

      const { result } = renderHook(() => useActiveDashboard('default'));

      expect(result.current.activeDashboard).toBeNull();
    });
  });

  describe('hasActiveDashboard', () => {
    it('returns false when no active dashboard exists', () => {
      mockActiveArtifact = null;

      const { result } = renderHook(() => useActiveDashboard('default'));

      expect(result.current.hasActiveDashboard).toBe(false);
    });

    it('returns true when an active dashboard exists', () => {
      mockActiveArtifact = createMockDashboard('test-dash');

      const { result } = renderHook(() => useActiveDashboard('default'));

      expect(result.current.hasActiveDashboard).toBe(true);
    });
  });

  describe('setActiveDashboard', () => {
    it('calls setActiveArtifact with the dashboard', () => {
      const { result } = renderHook(() => useActiveDashboard('default'));
      const dashboard = createMockDashboard('new-dash');

      act(() => {
        result.current.setActiveDashboard(dashboard);
      });

      expect(mockSetActiveArtifact).toHaveBeenCalledWith(dashboard);
    });

    it('opens the canvas', () => {
      const { result } = renderHook(() => useActiveDashboard('default'));
      const dashboard = createMockDashboard('new-dash');

      act(() => {
        result.current.setActiveDashboard(dashboard);
      });

      expect(mockOpenCanvas).toHaveBeenCalled();
    });
  });

  describe('clearActiveDashboard', () => {
    it('calls clearActiveArtifact', () => {
      const { result } = renderHook(() => useActiveDashboard('default'));

      act(() => {
        result.current.clearActiveDashboard();
      });

      expect(mockClearActiveArtifact).toHaveBeenCalled();
    });

    it('closes the canvas', () => {
      const { result } = renderHook(() => useActiveDashboard('default'));

      act(() => {
        result.current.clearActiveDashboard();
      });

      expect(mockCloseCanvas).toHaveBeenCalled();
    });
  });

  describe('addWidgetToDashboard', () => {
    it('creates a new dashboard when no active dashboard exists', () => {
      mockActiveArtifact = null;
      const { result } = renderHook(() => useActiveDashboard('test-namespace'));
      const widget = createMockWidgetArtifact('widget-1', 'My Widget');
      const toolCalls = createMockToolCalls();

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      expect(mockSetActiveArtifact).toHaveBeenCalledWith(
        expect.objectContaining({
          apiVersion: 'aladdin.openshift.io/v1alpha1',
          kind: 'AladdinDashboard',
          metadata: expect.objectContaining({
            namespace: 'test-namespace',
          }),
          spec: expect.objectContaining({
            title: 'Untitled Dashboard',
            description: 'Dashboard created from conversation',
          }),
        }),
      );
    });

    it('adds panel to existing dashboard when one exists', () => {
      mockActiveArtifact = createMockDashboard('existing-dash', 1);
      const { result } = renderHook(() => useActiveDashboard('default'));
      const widget = createMockWidgetArtifact('widget-1', 'My Widget');
      const toolCalls = createMockToolCalls();

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      expect(mockSetActiveArtifact).toHaveBeenCalledWith(
        expect.objectContaining({
          spec: expect.objectContaining({
            layout: expect.objectContaining({
              panels: expect.arrayContaining([
                expect.objectContaining({ id: 'panel-0' }), // existing panel
                expect.objectContaining({ title: 'My Widget' }), // new panel
              ]),
            }),
          }),
        }),
      );
    });

    it('uses widget title for panel title', () => {
      mockActiveArtifact = null;
      const { result } = renderHook(() => useActiveDashboard('default'));
      const widget = createMockWidgetArtifact('widget-1', 'CPU Metrics');
      const toolCalls = createMockToolCalls();

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      expect(mockSetActiveArtifact).toHaveBeenCalledWith(
        expect.objectContaining({
          spec: expect.objectContaining({
            layout: expect.objectContaining({
              panels: expect.arrayContaining([expect.objectContaining({ title: 'CPU Metrics' })]),
            }),
          }),
        }),
      );
    });

    it('uses "Widget" as default title when widget has no title', () => {
      mockActiveArtifact = null;
      const { result } = renderHook(() => useActiveDashboard('default'));
      const widget = createMockWidgetArtifact('widget-1'); // no title
      const toolCalls = createMockToolCalls();

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      expect(mockSetActiveArtifact).toHaveBeenCalledWith(
        expect.objectContaining({
          spec: expect.objectContaining({
            layout: expect.objectContaining({
              panels: expect.arrayContaining([expect.objectContaining({ title: 'Widget' })]),
            }),
          }),
        }),
      );
    });

    it('filters to only successful tool calls', () => {
      mockActiveArtifact = null;
      const { result } = renderHook(() => useActiveDashboard('default'));
      const widget = createMockWidgetArtifact('widget-1');
      const toolCalls: ToolCallState[] = [
        { id: 'tc-1', name: 'generate_ui', status: 'success', arguments: {}, result: '{}' },
        { id: 'tc-2', name: 'get_data', status: 'failure', arguments: {} },
        { id: 'tc-3', name: 'other_tool', status: 'success', arguments: {} },
      ];

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      const callArg = mockSetActiveArtifact.mock.calls[0][0] as AladdinDashboard;
      const persistedToolCalls = callArg.spec.layout.panels[0].dataSource.toolCalls;

      expect(persistedToolCalls).toHaveLength(2);
      expect(persistedToolCalls.map((tc) => tc.id)).toEqual(['tc-1', 'tc-3']);
    });

    it('only stores result for generate_ui tool calls', () => {
      mockActiveArtifact = null;
      const { result } = renderHook(() => useActiveDashboard('default'));
      const widget = createMockWidgetArtifact('widget-1');
      const toolCalls: ToolCallState[] = [
        {
          id: 'tc-1',
          name: 'generate_ui',
          status: 'success',
          arguments: {},
          result: '{"widget": "spec"}',
        },
        {
          id: 'tc-2',
          name: 'get_metrics',
          status: 'success',
          arguments: {},
          result: '{"metrics": "data"}',
        },
      ];

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      const callArg = mockSetActiveArtifact.mock.calls[0][0] as AladdinDashboard;
      const persistedToolCalls = callArg.spec.layout.panels[0].dataSource.toolCalls;

      expect(persistedToolCalls[0].result).toBe('{"widget": "spec"}');
      expect(persistedToolCalls[1].result).toBeUndefined();
    });

    it('sets dashboard as unsaved', () => {
      mockActiveArtifact = null;
      const { result } = renderHook(() => useActiveDashboard('default'));
      const widget = createMockWidgetArtifact('widget-1');
      const toolCalls = createMockToolCalls();

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      expect(mockSetDashboardSaved).toHaveBeenCalledWith(false);
    });

    it('opens the canvas', () => {
      mockActiveArtifact = null;
      const { result } = renderHook(() => useActiveDashboard('default'));
      const widget = createMockWidgetArtifact('widget-1');
      const toolCalls = createMockToolCalls();

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      expect(mockOpenCanvas).toHaveBeenCalled();
    });

    it('positions new panel below existing panels', () => {
      mockActiveArtifact = createMockDashboard('existing-dash', 2);
      // Existing panels are at y=0 and y=3, each with height=3
      // So max y + height = 3 + 3 = 6
      const { result } = renderHook(() => useActiveDashboard('default'));
      const widget = createMockWidgetArtifact('widget-1');
      const toolCalls = createMockToolCalls();

      act(() => {
        result.current.addWidgetToDashboard(widget, toolCalls);
      });

      const callArg = mockSetActiveArtifact.mock.calls[0][0] as AladdinDashboard;
      const newPanel = callArg.spec.layout.panels[2]; // third panel

      expect(newPanel.position.x).toBe(0);
      expect(newPanel.position.y).toBe(6); // below existing panels
    });
  });

  describe('saveDashboard', () => {
    it('throws error when no active dashboard exists', async () => {
      mockActiveArtifact = null;
      const { result } = renderHook(() => useActiveDashboard('default'));

      await expect(result.current.saveDashboard()).rejects.toThrow('No active dashboard to save');
    });

    it('calls createDashboard with dashboard name and spec', async () => {
      const dashboard = createMockDashboard('my-dashboard');
      mockActiveArtifact = dashboard;
      mockCreateDashboard.mockResolvedValue(dashboard);

      const { result } = renderHook(() => useActiveDashboard('default'));

      await act(async () => {
        await result.current.saveDashboard();
      });

      expect(mockCreateDashboard).toHaveBeenCalledWith('my-dashboard', dashboard.spec);
    });

    it('updates active artifact with saved dashboard', async () => {
      const dashboard = createMockDashboard('my-dashboard');
      const savedDashboard = {
        ...dashboard,
        metadata: { ...dashboard.metadata, resourceVersion: '12345' },
      };
      mockActiveArtifact = dashboard;
      mockCreateDashboard.mockResolvedValue(savedDashboard);

      const { result } = renderHook(() => useActiveDashboard('default'));

      await act(async () => {
        await result.current.saveDashboard();
      });

      expect(mockSetActiveArtifact).toHaveBeenCalledWith(savedDashboard);
    });

    it('sets dashboard as saved after successful save', async () => {
      const dashboard = createMockDashboard('my-dashboard');
      mockActiveArtifact = dashboard;
      mockCreateDashboard.mockResolvedValue(dashboard);

      const { result } = renderHook(() => useActiveDashboard('default'));

      await act(async () => {
        await result.current.saveDashboard();
      });

      expect(mockSetDashboardSaved).toHaveBeenCalledWith(true);
    });

    it('returns the saved dashboard', async () => {
      const dashboard = createMockDashboard('my-dashboard');
      const savedDashboard = {
        ...dashboard,
        metadata: { ...dashboard.metadata, resourceVersion: '12345' },
      };
      mockActiveArtifact = dashboard;
      mockCreateDashboard.mockResolvedValue(savedDashboard);

      const { result } = renderHook(() => useActiveDashboard('default'));

      let returnedDashboard: AladdinDashboard | undefined;
      await act(async () => {
        returnedDashboard = await result.current.saveDashboard();
      });

      expect(returnedDashboard).toEqual(savedDashboard);
    });
  });

  describe('isDashboardSaved', () => {
    it('returns the isDashboardSaved state from context', () => {
      mockIsDashboardSaved = true;

      const { result } = renderHook(() => useActiveDashboard('default'));

      expect(result.current.isDashboardSaved).toBe(true);
    });

    it('returns false when dashboard is not saved', () => {
      mockIsDashboardSaved = false;

      const { result } = renderHook(() => useActiveDashboard('default'));

      expect(result.current.isDashboardSaved).toBe(false);
    });
  });

  describe('memoization', () => {
    it('maintains stable function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useActiveDashboard('default'));

      const firstSetActiveDashboard = result.current.setActiveDashboard;
      const firstClearActiveDashboard = result.current.clearActiveDashboard;
      const firstAddWidgetToDashboard = result.current.addWidgetToDashboard;

      rerender();

      expect(result.current.setActiveDashboard).toBe(firstSetActiveDashboard);
      expect(result.current.clearActiveDashboard).toBe(firstClearActiveDashboard);
      expect(result.current.addWidgetToDashboard).toBe(firstAddWidgetToDashboard);
    });
  });
});
