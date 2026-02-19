import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * K8s Model for AladdinDashboard CRD
 * Used with k8sCreateResource, k8sGetResource, etc.
 */
export const AladdinDashboardModel = {
  apiVersion: 'v1alpha1',
  apiGroup: 'aladdin.openshift.io',
  kind: 'AladdinDashboard',
  plural: 'aladdindashboards',
  abbr: 'ADASH',
  namespaced: true,
  label: 'Aladdin Dashboard',
  labelPlural: 'Aladdin Dashboards',
};

/**
 * GroupVersionKind for useK8sWatchResource hook
 */
export const AladdinDashboardGVK = {
  group: 'aladdin.openshift.io',
  version: 'v1alpha1',
  kind: 'AladdinDashboard',
};

/**
 * Panel position in the grid layout
 */
export interface PanelPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * UI component configuration
 */
export interface PanelComponent {
  type: 'Chart' | 'Table' | 'Metric' | 'Alert' | 'Log' | 'Resource' | 'Custom';
  version?: string;
  config: Record<string, unknown>;
}

/**
 * Individual panel in a dashboard
 */
export interface DashboardPanel {
  id: string;
  title?: string;
  position: PanelPosition;
  component: PanelComponent;
}

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  columns?: number;
  panels: DashboardPanel[];
}

/**
 * AladdinDashboard spec
 */
export interface AladdinDashboardSpec {
  title: string;
  description?: string;
  refreshInterval?: string;
  layout: DashboardLayout;
  tags?: string[];
  owner?: string;
}

/**
 * AladdinDashboard status
 */
export interface AladdinDashboardStatus {
  observedGeneration?: number;
}

/**
 * Full AladdinDashboard resource type
 * Extends K8sResourceCommon for metadata (name, namespace, uid, etc.)
 */
export interface AladdinDashboard extends K8sResourceCommon {
  spec: AladdinDashboardSpec;
  status?: AladdinDashboardStatus;
}

/**
 * Helper to create a new dashboard resource object
 */
export function createDashboardResource(
  name: string,
  namespace: string,
  spec: AladdinDashboardSpec,
): AladdinDashboard {
  return {
    apiVersion: `${AladdinDashboardModel.apiGroup}/${AladdinDashboardModel.apiVersion}`,
    kind: AladdinDashboardModel.kind,
    metadata: {
      name,
      namespace,
    },
    spec,
  };
}
