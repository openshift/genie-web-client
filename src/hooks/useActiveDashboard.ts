import { useCallback, useMemo } from 'react';
import { useChatConversationContext } from './useChatConversation';
import { useDashboardActions } from './useDashboard';
import type {
  AladdinDashboard,
  AladdinDashboardSpec,
  DashboardPanel,
  ToolCall,
} from '../types/dashboard';
import type { ToolCallState } from '../utils/toolCallHelpers';
import type { WidgetArtifact } from '../types/chat';
import { isGenerateUITool } from '../utils/toolResultParsers';

interface UseActiveDashboardResult {
  /** The currently active dashboard (if artifact is an AladdinDashboard) */
  activeDashboard: AladdinDashboard | null;
  /** Set the active dashboard and open canvas */
  setActiveDashboard: (dashboard: AladdinDashboard) => void;
  /** Clear the active dashboard */
  clearActiveDashboard: () => void;
  /**
   * Add a widget to a dashboard.
   * If no dashboard exists, creates a local dashboard with default name/description.
   * Does NOT persist to K8s - call saveDashboard to persist.
   * @param widget - The widget to add
   * @param toolCalls - Tool calls from the message for persistence
   */
  addWidgetToDashboard: (widget: WidgetArtifact, toolCalls: ToolCallState[]) => void;
  /**
   * Save the active dashboard to K8s.
   * @returns The saved dashboard
   */
  saveDashboard: () => Promise<AladdinDashboard>;
  /** Whether there is an active dashboard */
  hasActiveDashboard: boolean;
  /** Whether the active dashboard has been saved to K8s */
  isDashboardSaved: boolean;
}

/**
 * Convert ToolCallState[] from chat to ToolCall[] for persistence.
 * - Filters to only successful tool calls
 * - Maps 'name' to 'tool'
 * - Only stores 'result' for generate_ui tools
 */
function convertToolCallsForPersistence(toolCallStates: ToolCallState[]): ToolCall[] {
  return toolCallStates
    .filter((tc) => tc.status === 'success')
    .map((tc) => ({
      id: tc.id,
      tool: tc.name,
      arguments: tc.arguments ?? {},
      result: isGenerateUITool(tc.name) ? tc.result : undefined,
    }));
}

/**
 * Generate a unique panel ID
 */
function generatePanelId(): string {
  return `panel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate the next available Y position in the dashboard grid
 */
function getNextPanelPosition(panels: DashboardPanel[]): { x: number; y: number } {
  if (panels.length === 0) {
    return { x: 0, y: 0 };
  }
  // Find the maximum y + height to place new panel below existing ones
  const maxY = Math.max(...panels.map((p) => p.position.y + p.position.height));
  return { x: 0, y: maxY };
}

/**
 * Generate a K8s-safe dashboard name
 */
function generateDashboardName(): string {
  return `dashboard-${Date.now()}`;
}

/**
 * Create a new local dashboard with default values
 */
function createLocalDashboard(namespace: string): AladdinDashboard {
  return {
    apiVersion: 'aladdin.openshift.io/v1alpha1',
    kind: 'AladdinDashboard',
    metadata: {
      name: generateDashboardName(),
      namespace,
    },
    spec: {
      title: 'Untitled Dashboard',
      description: 'Dashboard created from conversation',
      layout: {
        columns: 12,
        panels: [],
      },
    },
  };
}

/**
 * Hook for dashboard-specific operations.
 * Consumes ChatConversationContext and provides methods to manage the active dashboard.
 */
export function useActiveDashboard(namespace: string): UseActiveDashboardResult {
  const {
    activeArtifact,
    setActiveArtifact,
    clearActiveArtifact,
    openCanvas,
    closeCanvas,
    isDashboardSaved,
    setDashboardSaved,
  } = useChatConversationContext();
  const { createDashboard } = useDashboardActions(namespace);

  // Derive activeDashboard from activeArtifact when it's an AladdinDashboard
  const activeDashboard = useMemo((): AladdinDashboard | null => {
    if (activeArtifact && 'kind' in activeArtifact && activeArtifact.kind === 'AladdinDashboard') {
      return activeArtifact as AladdinDashboard;
    }
    return null;
  }, [activeArtifact]);

  const hasActiveDashboard = activeDashboard !== null;

  const setActiveDashboard = useCallback(
    (dashboard: AladdinDashboard) => {
      setActiveArtifact(dashboard);
      openCanvas();
    },
    [setActiveArtifact, openCanvas],
  );

  const clearActiveDashboard = useCallback(() => {
    clearActiveArtifact();
    closeCanvas();
  }, [clearActiveArtifact, closeCanvas]);

  const addWidgetToDashboard = useCallback(
    (widget: WidgetArtifact, toolCalls: ToolCallState[]): void => {
      // Use existing dashboard or create a new local one
      const dashboard = activeDashboard ?? createLocalDashboard(namespace);

      // Convert tool calls for persistence
      const persistedToolCalls = convertToolCallsForPersistence(toolCalls);

      // Create the new panel
      const existingPanels = dashboard.spec.layout.panels ?? [];
      const position = getNextPanelPosition(existingPanels);

      const newPanel: DashboardPanel = {
        id: generatePanelId(),
        title: widget.widget.title ?? 'Widget',
        position: {
          ...position,
          width: 6,
          height: 3,
        },
        component: {
          type: 'Custom',
          config: widget.widget.spec,
        },
        dataSource: {
          toolCalls: persistedToolCalls,
        },
      };

      // Update the dashboard with the new panel
      const updatedSpec: AladdinDashboardSpec = {
        ...dashboard.spec,
        layout: {
          ...dashboard.spec.layout,
          panels: [...existingPanels, newPanel],
        },
      };

      const updatedDashboard: AladdinDashboard = {
        ...dashboard,
        spec: updatedSpec,
      };

      // Update local state only - do NOT persist to K8s
      setActiveArtifact(updatedDashboard);
      setDashboardSaved(false);
      openCanvas();
    },
    [activeDashboard, namespace, setActiveArtifact, setDashboardSaved, openCanvas],
  );

  const saveDashboard = useCallback(async (): Promise<AladdinDashboard> => {
    if (!activeDashboard) {
      throw new Error('No active dashboard to save');
    }

    // Persist to K8s
    const savedDashboard = await createDashboard(
      activeDashboard.metadata?.name ?? generateDashboardName(),
      activeDashboard.spec,
    );

    // Update active artifact with saved dashboard (includes K8s metadata like resourceVersion)
    setActiveArtifact(savedDashboard);
    setDashboardSaved(true);

    return savedDashboard;
  }, [activeDashboard, createDashboard, setActiveArtifact, setDashboardSaved]);

  return useMemo(
    () => ({
      activeDashboard,
      setActiveDashboard,
      clearActiveDashboard,
      addWidgetToDashboard,
      saveDashboard,
      hasActiveDashboard,
      isDashboardSaved,
    }),
    [
      activeDashboard,
      setActiveDashboard,
      clearActiveDashboard,
      addWidgetToDashboard,
      saveDashboard,
      hasActiveDashboard,
      isDashboardSaved,
    ],
  );
}
