import React, { useMemo, useCallback } from 'react';
import { useDashboards } from '../../hooks/useDashboards';
import { useActiveDashboard } from '../../hooks/useActiveDashboard';
import { useChatConversationContext } from '../../hooks/useChatConversation';
import { DEFAULT_DASHBOARD_NAMESPACE } from '../../types/dashboard';
import { CanvasCard } from '../canvas/CanvasCard';

export interface ConversationDashboardsProps {
  conversationId: string;
  shouldDisplay: boolean;
}

/**
 * Displays the dashboard associated with a conversation using the CanvasCard component.
 */
export const ConversationDashboards: React.FunctionComponent<ConversationDashboardsProps> = ({
  conversationId,
  shouldDisplay,
}) => {
  const { getDashboardsForConversation, loaded } = useDashboards({
    namespace: DEFAULT_DASHBOARD_NAMESPACE,
  });
  const { setActiveDashboard, activeDashboard, clearActiveDashboard } = useActiveDashboard(
    DEFAULT_DASHBOARD_NAMESPACE,
    conversationId,
  );
  const { isCanvasOpen } = useChatConversationContext();

  const dashboard = useMemo(() => {
    if (!loaded || !shouldDisplay || !conversationId) return null;
    const dashboards = getDashboardsForConversation(conversationId);
    // Return the first dashboard (should only be one per conversation)
    return dashboards.length > 0 ? dashboards[0] : null;
  }, [conversationId, getDashboardsForConversation, loaded, shouldDisplay]);

  const isViewing = useMemo(() => {
    if (!dashboard || !activeDashboard || !isCanvasOpen) return false;

    // Check if the active dashboard matches this dashboard
    const dashboardUid = dashboard.metadata?.uid ?? dashboard.metadata?.name ?? '';
    const activeDashboardUid =
      activeDashboard.metadata?.uid ?? activeDashboard.metadata?.name ?? '';

    return dashboardUid === activeDashboardUid;
  }, [dashboard, activeDashboard, isCanvasOpen]);

  const handleOpenDashboard = useCallback(() => {
    if (dashboard) {
      setActiveDashboard(dashboard);
    }
  }, [dashboard, setActiveDashboard]);

  if (!loaded || !dashboard) {
    return null;
  }

  const dashboardUid = dashboard.metadata?.uid ?? dashboard.metadata?.name ?? '';
  const lastModified = dashboard.metadata?.creationTimestamp
    ? new Date(dashboard.metadata.creationTimestamp)
    : new Date();

  return (
    <CanvasCard
      artifactId={dashboardUid}
      title={dashboard.spec.title}
      type="dashboard"
      lastModified={lastModified}
      isViewing={isViewing}
      onOpen={handleOpenDashboard}
      onClose={clearActiveDashboard}
    />
  );
};
