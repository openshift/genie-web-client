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
   * @param widget - The widget to add
   * @param toolCalls - Tool calls from the message for persistence
   * @param targetDashboard - Optional dashboard to add to (overrides activeDashboard)
   */
  addWidgetToDashboard: (
    widget: WidgetArtifact,
    toolCalls: ToolCallState[],
    targetDashboard?: AladdinDashboard,
  ) => Promise<{ dashboard: AladdinDashboard; needsSelection: boolean }>;
  /** Whether there is an active dashboard */
  hasActiveDashboard: boolean;
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
 * Hook for dashboard-specific operations.
 * Consumes ChatConversationContext and provides methods to manage the active dashboard.
 */
export function useActiveDashboard(namespace: string): UseActiveDashboardResult {
  const { activeArtifact, setActiveArtifact, clearActiveArtifact, openCanvas } =
    useChatConversationContext();
  const { updateDashboard } = useDashboardActions(namespace);

  // Derive activeDashboard from activeArtifact when it's an AladdinDashboard
  const activeDashboard = useMemo((): AladdinDashboard | null => {
    if (activeArtifact && activeArtifact.kind === 'AladdinDashboard') {
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
  }, [clearActiveArtifact]);

  const addWidgetToDashboard = useCallback(
    async (
      widget: WidgetArtifact,
      toolCalls: ToolCallState[],
      targetDashboard?: AladdinDashboard,
    ): Promise<{ dashboard: AladdinDashboard; needsSelection: boolean }> => {
      // Use targetDashboard if provided, otherwise fall back to activeDashboard
      const dashboard = targetDashboard ?? activeDashboard;

      // If no dashboard available, signal that selection is needed
      if (!dashboard) {
        return {
          dashboard: null as unknown as AladdinDashboard,
          needsSelection: true,
        };
      }

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

      // Persist to K8s
      const savedDashboard = await updateDashboard(updatedDashboard);

      // Update active artifact with saved dashboard
      setActiveArtifact(savedDashboard);
      openCanvas();

      return {
        dashboard: savedDashboard,
        needsSelection: false,
      };
    },
    [activeDashboard, updateDashboard, setActiveArtifact, openCanvas],
  );

  return useMemo(
    () => ({
      activeDashboard,
      setActiveDashboard,
      clearActiveDashboard,
      addWidgetToDashboard,
      hasActiveDashboard,
    }),
    [
      activeDashboard,
      setActiveDashboard,
      clearActiveDashboard,
      addWidgetToDashboard,
      hasActiveDashboard,
    ],
  );
}
