import { renderHook } from '../unitTestUtils';
import { useDashboards } from './useDashboards';
import type { AladdinDashboard } from '../types/dashboard';

// Mock the dynamic plugin SDK
const mockUseK8sWatchResource = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: (...args: unknown[]) => mockUseK8sWatchResource(...args),
}));

// Helper to create a mock dashboard with panels
const createMockDashboard = (
  name: string,
  panels: Array<{
    id: string;
    widgetId?: string;
  }> = [],
): AladdinDashboard => ({
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
      panels: panels.map((p) => ({
        id: p.id,
        title: `Panel ${p.id}`,
        position: { x: 0, y: 0, width: 6, height: 3 },
        component: {
          type: 'Chart' as const,
          config: p.widgetId ? { widgetId: p.widgetId } : {},
        },
      })),
    },
  },
});

describe('useDashboards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseK8sWatchResource.mockReturnValue([[], true, null]);
  });

  describe('dashboards', () => {
    it('returns empty array when no dashboards exist', () => {
      mockUseK8sWatchResource.mockReturnValue([[], true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.dashboards).toEqual([]);
    });

    it('returns dashboards from useK8sWatchResource', () => {
      const dashboards = [createMockDashboard('dash-1'), createMockDashboard('dash-2')];
      mockUseK8sWatchResource.mockReturnValue([dashboards, true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.dashboards).toHaveLength(2);
      expect(result.current.dashboards[0].metadata?.name).toBe('dash-1');
      expect(result.current.dashboards[1].metadata?.name).toBe('dash-2');
    });

    it('returns empty array when useK8sWatchResource returns null', () => {
      mockUseK8sWatchResource.mockReturnValue([null, true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.dashboards).toEqual([]);
    });
  });

  describe('loaded', () => {
    it('returns loaded state from useK8sWatchResource', () => {
      mockUseK8sWatchResource.mockReturnValue([[], false, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.loaded).toBe(false);
    });

    it('returns true when loading is complete', () => {
      mockUseK8sWatchResource.mockReturnValue([[], true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.loaded).toBe(true);
    });
  });

  describe('error', () => {
    it('returns null when there is no error', () => {
      mockUseK8sWatchResource.mockReturnValue([[], true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.error).toBeNull();
    });

    it('returns error from useK8sWatchResource', () => {
      const error = new Error('Failed to fetch dashboards');
      mockUseK8sWatchResource.mockReturnValue([[], true, error]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.error).toBe(error);
    });
  });

  describe('getDashboardForWidgetId', () => {
    it('returns null when no dashboards exist', () => {
      mockUseK8sWatchResource.mockReturnValue([[], true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.getDashboardForWidgetId('widget-123')).toBeNull();
    });

    it('returns null when widget ID is not found', () => {
      const dashboards = [createMockDashboard('dash-1', [{ id: 'panel-1', widgetId: 'widget-1' }])];
      mockUseK8sWatchResource.mockReturnValue([dashboards, true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.getDashboardForWidgetId('widget-unknown')).toBeNull();
    });

    it('returns dashboard and panel reference when widget ID is found', () => {
      const dashboards = [createMockDashboard('dash-1', [{ id: 'panel-1', widgetId: 'widget-1' }])];
      mockUseK8sWatchResource.mockReturnValue([dashboards, true, null]);

      const { result } = renderHook(() => useDashboards());

      const ref = result.current.getDashboardForWidgetId('widget-1');

      expect(ref).not.toBeNull();
      expect(ref?.dashboard.metadata?.name).toBe('dash-1');
      expect(ref?.panel.id).toBe('panel-1');
    });

    it('finds widget in second panel', () => {
      const dashboards = [
        createMockDashboard('dash-1', [
          { id: 'panel-1', widgetId: 'widget-1' },
          { id: 'panel-2', widgetId: 'widget-2' },
        ]),
      ];
      mockUseK8sWatchResource.mockReturnValue([dashboards, true, null]);

      const { result } = renderHook(() => useDashboards());

      const ref = result.current.getDashboardForWidgetId('widget-2');

      expect(ref?.panel.id).toBe('panel-2');
    });

    it('finds widget across multiple dashboards', () => {
      const dashboards = [
        createMockDashboard('dash-1', [{ id: 'panel-1', widgetId: 'widget-1' }]),
        createMockDashboard('dash-2', [{ id: 'panel-2', widgetId: 'widget-2' }]),
      ];
      mockUseK8sWatchResource.mockReturnValue([dashboards, true, null]);

      const { result } = renderHook(() => useDashboards());

      const ref = result.current.getDashboardForWidgetId('widget-2');

      expect(ref?.dashboard.metadata?.name).toBe('dash-2');
      expect(ref?.panel.id).toBe('panel-2');
    });

    it('handles dashboards with empty panels array', () => {
      const dashboards = [createMockDashboard('dash-1', [])];
      mockUseK8sWatchResource.mockReturnValue([dashboards, true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.getDashboardForWidgetId('widget-1')).toBeNull();
    });

    it('handles panels without widgetId in config', () => {
      const dashboards = [createMockDashboard('dash-1', [{ id: 'panel-1' }])];
      mockUseK8sWatchResource.mockReturnValue([dashboards, true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.getDashboardForWidgetId('widget-1')).toBeNull();
    });

    it('handles malformed dashboard with missing spec', () => {
      const malformedDashboard = {
        apiVersion: 'aladdin.openshift.io/v1alpha1',
        kind: 'AladdinDashboard',
        metadata: { name: 'dash-1' },
      } as AladdinDashboard;
      mockUseK8sWatchResource.mockReturnValue([[malformedDashboard], true, null]);

      const { result } = renderHook(() => useDashboards());

      expect(result.current.getDashboardForWidgetId('widget-1')).toBeNull();
    });
  });

  describe('memoization', () => {
    it('maintains stable getDashboardForWidgetId reference when dashboards do not change', () => {
      const dashboards = [createMockDashboard('dash-1')];
      mockUseK8sWatchResource.mockReturnValue([dashboards, true, null]);

      const { result, rerender } = renderHook(() => useDashboards());

      const firstRef = result.current.getDashboardForWidgetId;
      rerender();
      const secondRef = result.current.getDashboardForWidgetId;

      expect(firstRef).toBe(secondRef);
    });
  });
});
