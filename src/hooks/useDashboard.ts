import { useCallback, useMemo } from 'react';
import {
  k8sCreate,
  k8sDelete,
  k8sGet,
  k8sUpdate,
  useK8sWatchResource,
  K8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  AladdinDashboard,
  AladdinDashboardGVK,
  AladdinDashboardModel,
  AladdinDashboardSpec,
  createDashboardResource,
} from '../types/dashboard';

interface UseDashboardsOptions {
  namespace: string;
}

interface UseDashboardsResult {
  dashboards: AladdinDashboard[];
  loaded: boolean;
  error: Error | null;
}

/**
 * Hook to watch all dashboards in a namespace
 */
export function useDashboards({ namespace }: UseDashboardsOptions): UseDashboardsResult {
  const [dashboards, loaded, error] = useK8sWatchResource<AladdinDashboard[]>({
    groupVersionKind: AladdinDashboardGVK,
    namespace,
    isList: true,
  });

  return {
    dashboards: dashboards ?? [],
    loaded,
    error: error as Error | null,
  };
}

interface UseDashboardOptions {
  name: string;
  namespace: string;
}

interface UseDashboardResult {
  dashboard: AladdinDashboard | null;
  loaded: boolean;
  error: Error | null;
}

/**
 * Hook to watch a single dashboard by name
 */
export function useDashboard({ name, namespace }: UseDashboardOptions): UseDashboardResult {
  const [dashboard, loaded, error] = useK8sWatchResource<AladdinDashboard>({
    groupVersionKind: AladdinDashboardGVK,
    name,
    namespace,
  });

  return {
    dashboard: dashboard ?? null,
    loaded,
    error: error as Error | null,
  };
}

/**
 * Hook providing CRUD operations for dashboards
 */
export function useDashboardActions(namespace: string) {
  const createDashboard = useCallback(
    async (name: string, spec: AladdinDashboardSpec): Promise<AladdinDashboard> => {
      const resource = createDashboardResource(name, namespace, spec);
      return k8sCreate({
        model: AladdinDashboardModel as K8sModel,
        data: resource,
      });
    },
    [namespace],
  );

  const getDashboard = useCallback(
    async (name: string): Promise<AladdinDashboard> => {
      return k8sGet({
        model: AladdinDashboardModel as K8sModel,
        name,
        ns: namespace,
      });
    },
    [namespace],
  );

  const updateDashboard = useCallback(
    async (dashboard: AladdinDashboard): Promise<AladdinDashboard> => {
      return k8sUpdate({
        model: AladdinDashboardModel as K8sModel,
        data: dashboard,
      });
    },
    [],
  );

  const deleteDashboard = useCallback(async (dashboard: AladdinDashboard): Promise<void> => {
    await k8sDelete({
      model: AladdinDashboardModel as K8sModel,
      resource: dashboard,
    });
  }, []);

  return useMemo(
    () => ({
      createDashboard,
      getDashboard,
      updateDashboard,
      deleteDashboard,
    }),
    [createDashboard, getDashboard, updateDashboard, deleteDashboard],
  );
}

export { AladdinDashboard, AladdinDashboardSpec };
