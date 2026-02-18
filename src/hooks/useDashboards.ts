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
  /** Look up which dashboard/panel contains a given tool call ID */
  getDashboardForToolCall: (toolCallId: string) => DashboardPanelRef | null;
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

  // Build a lookup map from toolCallId -> { dashboard, panel }
  // This allows O(1) lookup to check if a widget is already on a dashboard
  const toolCallLookup = useMemo(() => {
    const lookup = new Map<string, DashboardPanelRef>();

    for (const dashboard of dashboardList) {
      const panels = dashboard.spec?.layout?.panels ?? [];
      for (const panel of panels) {
        const toolCalls = panel.dataSource?.toolCalls ?? [];
        for (const toolCall of toolCalls) {
          if (toolCall.id) {
            lookup.set(toolCall.id, { dashboard, panel });
          }
        }
      }
    }

    return lookup;
  }, [dashboardList]);

  const getDashboardForToolCall = useCallback(
    (toolCallId: string): DashboardPanelRef | null => {
      return toolCallLookup.get(toolCallId) ?? null;
    },
    [toolCallLookup],
  );

  return {
    dashboards: dashboardList,
    loaded,
    error: error as Error | null,
    getDashboardForToolCall,
  };
}
