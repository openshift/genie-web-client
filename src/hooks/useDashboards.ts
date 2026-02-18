import { useCallback, useMemo } from 'react';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { AladdinDashboard, AladdinDashboardGVK, DashboardPanel } from '../types/dashboard';

/**
 * Reference to a dashboard and the specific panel containing a tool call
 */
export interface DashboardPanelRef {
  dashboard: AladdinDashboard;
  panel: DashboardPanel;
}

export interface UseDashboardsResult {
  dashboards: AladdinDashboard[];
  loaded: boolean;
  error: Error | null;
  /** Look up which dashboard/panel contains a given widget ID */
  getDashboardForWidgetId: (widgetId: string) => DashboardPanelRef | null;
}

/**
 * Hook to watch all dashboards in a namespace
 */
export function useDashboards(): UseDashboardsResult {
  const [dashboards, loaded, error] = useK8sWatchResource<AladdinDashboard[]>({
    groupVersionKind: AladdinDashboardGVK,
    namespace: 'default',
    isList: true,
  });

  const dashboardList = dashboards ?? [];

  // Build a lookup map from widgetId -> { dashboard, panel }
  // This allows O(1) lookup to check if a widget is already on a dashboard
  const widgetLookup = useMemo(() => {
    const lookup = new Map<string, DashboardPanelRef>();

    for (const dashboard of dashboardList) {
      const panels = dashboard.spec?.layout?.panels ?? [];
      for (const panel of panels) {
        const widgetId = panel.component?.config?.widgetId as string | undefined;
        if (widgetId) {
          lookup.set(widgetId, { dashboard, panel });
        }
      }
    }

    return lookup;
  }, [dashboardList]);

  const getDashboardForWidgetId = useCallback(
    (widgetId: string): DashboardPanelRef | null => {
      return widgetLookup.get(widgetId) ?? null;
    },
    [widgetLookup],
  );

  return {
    dashboards: dashboardList,
    loaded,
    error: error as Error | null,
    getDashboardForWidgetId,
  };
}
