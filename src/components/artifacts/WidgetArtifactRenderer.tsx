import React, { useCallback, useMemo } from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import type { WidgetArtifact } from '../../types/chat';
import { WidgetRenderer } from './WidgetRenderer';
import { CanvasCard } from '../canvas/CanvasCard';
import { useActiveDashboard } from '../../hooks/useActiveDashboard';
import { useDashboards } from '../../hooks/useDashboards';

export interface WidgetArtifactRendererProps {
  /** The widget artifact to render */
  artifact: WidgetArtifact;
}

/**
 * Renders a widget artifact.
 * If the widget is on a dashboard, shows a CanvasCard.
 * Otherwise, renders the widget inline with an "Add to Dashboard" button.
 */
const DEFAULT_NAMESPACE = 'default';

export const WidgetArtifactRenderer: React.FunctionComponent<WidgetArtifactRendererProps> = ({
  artifact,
}) => {
  const { addWidgetToDashboard, setActiveDashboard, activeDashboard, clearActiveDashboard } =
    useActiveDashboard(DEFAULT_NAMESPACE);
  const { getDashboardForWidgetId } = useDashboards();

  // Look up if this widget is already on a dashboard by widget ID
  const dashboardRef = useMemo(() => {
    const ref = getDashboardForWidgetId(artifact.widget.id);
    if (!ref) return null;

    return {
      dashboard: ref.dashboard,
      panelTitle: ref.panel.title,
    };
  }, [artifact.widget.id, getDashboardForWidgetId]);

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
    addWidgetToDashboard(artifact);
  }, [artifact, addWidgetToDashboard]);

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
        <WidgetRenderer widget={artifact.widget} />
      </FlexItem>
    </Flex>
  );
};
