import React, { useCallback, useMemo } from 'react';
import type { Artifact, WidgetArtifact } from '../../types/chat';
import type { ToolCallState } from '../../utils/toolCallHelpers';
import type { AladdinDashboard } from '../../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useActiveDashboard } from '../../hooks/useActiveDashboard';
import { useDashboards } from '../../hooks/useDashboard';
import { CanvasCard } from '../canvas/CanvasCard';

export interface ArtifactRendererProps {
  artifacts: Artifact[];
  /** Tool calls from the message, used to look up query args for Perses components */
  toolCalls?: ToolCallState[];
  /** Namespace for dashboard operations */
  namespace?: string;
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

export const ArtifactRenderer: React.FunctionComponent<ArtifactRendererProps> = ({
  artifacts,
  toolCalls,
  namespace = 'default',
}) => {
  const { addWidgetToDashboard, setActiveDashboard, activeDashboard, clearActiveDashboard } =
    useActiveDashboard(namespace);
  const { getDashboardForToolCall } = useDashboards({ namespace });

  const handleAddToDashboard = useCallback(
    (artifact: WidgetArtifact) => {
      if (!toolCalls) {
        return;
      }

      // Add widget directly - will create a local dashboard if none exists
      addWidgetToDashboard(artifact, toolCalls);
    },
    [toolCalls, addWidgetToDashboard],
  );

  // Handler to open a dashboard in the canvas when clicking on a CanvasCard
  const handleOpenDashboard = useCallback(
    (_artifactId: string, dashboard: AladdinDashboard) => {
      setActiveDashboard(dashboard);
    },
    [setActiveDashboard],
  );

  // Build a lookup from artifact ID to its dashboard reference (if on a dashboard)
  const artifactDashboardLookup = useMemo(() => {
    const lookup = new Map<
      string,
      { dashboard: AladdinDashboard; panelTitle: string | undefined }
    >();

    for (const artifact of artifacts) {
      const toolCallId = findToolCallIdForArtifact(artifact.id, toolCalls);
      if (toolCallId) {
        const ref = getDashboardForToolCall(toolCallId);
        if (ref) {
          lookup.set(artifact.id, {
            dashboard: ref.dashboard,
            panelTitle: ref.panel.title,
          });
        }
      }
    }

    return lookup;
  }, [artifacts, toolCalls, getDashboardForToolCall]);

  if (artifacts.length === 0) {
    return null;
  }

  return (
    <>
      {artifacts.map((artifact) => {
        switch (artifact.type) {
          case 'widget': {
            // Check if this widget is already on a dashboard
            const dashboardRef = artifactDashboardLookup.get(artifact.id);

            if (dashboardRef) {
              // Widget is on a dashboard - show a CanvasCard instead
              const { dashboard } = dashboardRef;
              const dashboardUid = dashboard.metadata?.uid ?? dashboard.metadata?.name ?? '';
              const isViewing =
                activeDashboard?.metadata?.uid === dashboardUid ||
                activeDashboard?.metadata?.name === dashboard.metadata?.name;

              return (
                <CanvasCard
                  key={artifact.id}
                  artifactId={dashboardUid}
                  title={dashboard.spec.title}
                  type="dashboard"
                  lastModified={
                    dashboard.metadata?.creationTimestamp
                      ? new Date(dashboard.metadata.creationTimestamp)
                      : new Date()
                  }
                  isViewing={isViewing}
                  onOpen={() => handleOpenDashboard(dashboardUid, dashboard)}
                  onClose={clearActiveDashboard}
                />
              );
            }

            // Widget not on a dashboard - render inline with "Add to Dashboard" button
            return (
              <Flex key={artifact.id} direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
                  <Button
                    variant="primary"
                    icon={<PlusIcon />}
                    onClick={() => handleAddToDashboard(artifact)}
                    size="sm"
                  >
                    Add to dashboard
                  </Button>
                </FlexItem>
                <FlexItem>
                  <WidgetRenderer widget={artifact.widget} toolCalls={toolCalls} />
                </FlexItem>
              </Flex>
            );
          }

          case 'dashboard':
            // Render dashboard with multiple widgets
            return (
              <div key={artifact.id}>
                <p>Dashboard: {artifact.widgets.length} widgets</p>
                {artifact.widgets.map((widget) => (
                  <WidgetRenderer key={widget.id} widget={widget} toolCalls={toolCalls} />
                ))}
              </div>
            );

          case 'code':
            // Future: Implement code block renderer
            return (
              <div key={artifact.id}>
                <p>Code artifact rendering not yet implemented</p>
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
};
