import React, { useCallback, useMemo } from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import type { WidgetArtifact } from '../../types/chat';
import type { ToolCallState } from '../../utils/toolCallHelpers';
import { WidgetRenderer } from './WidgetRenderer';
import { CanvasCard } from '../canvas/CanvasCard';
import { useActiveDashboard } from '../../hooks/useActiveDashboard';
import { useDashboards } from '../../hooks/useDashboards';
import { useActiveConversation } from '../../hooks/AIState';
import { DEFAULT_DASHBOARD_NAMESPACE } from '../../types/dashboard';

export interface WidgetArtifactRendererProps {
  /** The widget artifact to render */
  artifact: WidgetArtifact;
  /** Tool calls from the message */
  toolCalls?: ToolCallState[];
}

/**
 * Find the tool call ID that produced a given artifact.
 * Matches by checking if the artifact's id exists in any tool call's artifacts array.
 */
function findToolCallIdForArtifact(
  artifactId: string,
  toolCalls: ToolCallState[] | undefined,
): string | null {
  if (!toolCalls) return null;

  for (const tc of toolCalls) {
    if (tc.artifacts?.some((a) => a.id === artifactId)) {
      return tc.id;
    }
  }
  return null;
}

/**
 * Renders a widget artifact.
 * If the widget is on a dashboard, shows a CanvasCard.
 * Otherwise, renders the widget inline with an "Add to Dashboard" button.
 */
export const WidgetArtifactRenderer: React.FunctionComponent<WidgetArtifactRendererProps> = ({
  artifact,
  toolCalls,
}) => {
  const activeConversation = useActiveConversation();
  const { addWidgetToDashboard, setActiveDashboard, activeDashboard, clearActiveDashboard } =
    useActiveDashboard(DEFAULT_DASHBOARD_NAMESPACE, activeConversation?.id);
  const { getDashboardForToolCall } = useDashboards({ namespace: DEFAULT_DASHBOARD_NAMESPACE });

  // Look up if this widget is already on a dashboard
  const dashboardRef = useMemo(() => {
    const toolCallId = findToolCallIdForArtifact(artifact.id, toolCalls);
    if (!toolCallId) return null;

    const ref = getDashboardForToolCall(toolCallId);
    if (!ref) return null;

    return {
      dashboard: ref.dashboard,
      panelTitle: ref.panel.title,
    };
  }, [artifact.id, toolCalls, getDashboardForToolCall]);

  // Calculate if this widget's dashboard is currently being viewed
  const isViewing = useMemo(() => {
    if (!dashboardRef) return false;

    const dashboardUid =
      dashboardRef.dashboard.metadata?.uid ?? dashboardRef.dashboard.metadata?.name ?? '';

    return (
      activeDashboard?.metadata?.uid === dashboardUid ||
      activeDashboard?.metadata?.name === dashboardRef.dashboard.metadata?.name
    );
  }, [dashboardRef, activeDashboard]);

  const handleAddToDashboard = useCallback(() => {
    if (!toolCalls) return;
    addWidgetToDashboard(artifact, toolCalls);
  }, [artifact, toolCalls, addWidgetToDashboard]);

  const handleOpenDashboard = useCallback(() => {
    if (dashboardRef) {
      setActiveDashboard(dashboardRef.dashboard);
    }
  }, [dashboardRef, setActiveDashboard]);

  // Widget is on a dashboard - show a CanvasCard instead
  if (dashboardRef) {
    const { dashboard } = dashboardRef;
    const dashboardUid = dashboard.metadata?.uid ?? dashboard.metadata?.name ?? '';

    return (
      <CanvasCard
        artifactId={dashboardUid}
        title={dashboard.spec.title}
        type="dashboard"
        lastModified={
          dashboard.metadata?.creationTimestamp
            ? new Date(dashboard.metadata.creationTimestamp)
            : new Date()
        }
        isViewing={isViewing}
        onOpen={handleOpenDashboard}
        onClose={clearActiveDashboard}
      />
    );
  }

  // Widget not on a dashboard - render inline with "Add to Dashboard" button
  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
      <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
        <Button variant="primary" icon={<PlusIcon />} onClick={handleAddToDashboard} size="sm">
          Add to dashboard
        </Button>
      </FlexItem>
      <FlexItem>
        <WidgetRenderer widget={artifact.widget} toolCalls={toolCalls} />
      </FlexItem>
    </Flex>
  );
};
