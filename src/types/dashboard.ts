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

/** Default namespace for AladdinDashboard resources; use for useDashboards, useActiveDashboard, useDashboardActions. */
export const DEFAULT_DASHBOARD_NAMESPACE = 'default';

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
 * MCP tool call information for data retrieval.
 * Stores the tool invocation details needed to recreate widgets on dashboards.
 */
export interface ToolCall {
  /** Unique identifier for the tool call */
  id: string;
  /** MCP server that handled the request */
  server?: string;
  /** Name of the tool that was invoked */
  tool: string;
  /** Arguments passed to the tool call */
  arguments: Record<string, unknown>;
  /** Tool result - only stored for generate_ui (contains NGUI widget spec) */
  result?: string;
  /** Links to the original Lightspeed API request */
  requestId?: string;
}

/**
 * Data source configuration for a panel.
 * Contains all tool calls from the message that produced the widget.
 */
export interface PanelDataSource {
  /** Array of tool calls needed to recreate the widget */
  toolCalls: ToolCall[];
}

/**
 * Individual panel in a dashboard
 */
export interface DashboardPanel {
  id: string;
  title?: string;
  position: PanelPosition;
  component: PanelComponent;
  dataSource: PanelDataSource;
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
  conversationId?: string;
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
