import { useCallback, useMemo } from 'react';
import {
  k8sCreate,
  k8sDelete,
  k8sGet,
  k8sUpdate,
  K8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  AladdinDashboard,
  AladdinDashboardModel,
  AladdinDashboardSpec,
  createDashboardResource,
} from '../types/dashboard';

export interface UseDashboardActionsResult {
  createDashboard: (name: string, spec: AladdinDashboardSpec) => Promise<AladdinDashboard>;
  getDashboard: (name: string) => Promise<AladdinDashboard>;
  updateDashboard: (dashboard: AladdinDashboard) => Promise<AladdinDashboard>;
  deleteDashboard: (dashboard: AladdinDashboard) => Promise<void>;
}

/**
 * Hook providing CRUD operations for dashboards
 */
export function useDashboardActions(namespace: string): UseDashboardActionsResult {
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
