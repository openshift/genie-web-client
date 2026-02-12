import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { AladdinDashboard, AladdinDashboardGVK } from '../types/dashboard';

export interface UseDashboardOptions {
  name: string;
  namespace: string;
}

export interface UseDashboardResult {
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
