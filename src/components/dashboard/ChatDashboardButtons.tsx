import React, { useCallback, useState, useMemo } from 'react';
import { Card, CardTitle, CardBody, CardHeader, GridItem, Grid } from '@patternfly/react-core';
import { RhUiCatalogIcon } from '@patternfly/react-icons';
import { useActiveDashboard } from '../../hooks/useActiveDashboard';
import { useDashboardActions } from '../../hooks/useDashboardActions';
import { useActiveConversation, useSendStreamMessage } from '../../hooks/AIState';
import { useDashboards } from '../../hooks/useDashboards';
import { DEFAULT_DASHBOARD_NAMESPACE } from '../../types/dashboard';

/** Message sent to the LLM when the user creates a dashboard from scratch (for chat history / context). */
const CREATING_FROM_SCRATCH_MESSAGE = 'I am creating a dashboard from scratch.';

export const ChatDashboardButtons: React.FC = () => {
  const activeConversation = useActiveConversation();
  const sendStreamMessage = useSendStreamMessage();
  const { createDashboard } = useDashboardActions(DEFAULT_DASHBOARD_NAMESPACE);
  const { setActiveDashboard } = useActiveDashboard(
    DEFAULT_DASHBOARD_NAMESPACE,
    activeConversation?.id,
  );
  const { getDashboardsForConversation, loaded } = useDashboards({
    namespace: DEFAULT_DASHBOARD_NAMESPACE,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Check if a dashboard already exists for this conversation
  const existingDashboard = useMemo(() => {
    if (!loaded || !activeConversation?.id) return null;
    const dashboards = getDashboardsForConversation(activeConversation.id);
    return dashboards.length > 0 ? dashboards[0] : null;
  }, [loaded, activeConversation?.id, getDashboardsForConversation]);

  const handleStartFromScratch = useCallback(async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      // Generate unique dashboard name
      const dashboardName = `dashboard-${Date.now()}`;

      // Create new dashboard with empty layout
      const newDashboard = await createDashboard(dashboardName, {
        title: 'Untitled Dashboard',
        description: 'Dashboard created from scratch',
        conversationId: activeConversation?.id,
        layout: {
          columns: 12,
          panels: [],
        },
      });

      // Set as active and open canvas
      setActiveDashboard(newDashboard);

      // Notify the LLM for chat history / context (message appears in thread; backend may still respond)
      sendStreamMessage(CREATING_FROM_SCRATCH_MESSAGE);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create dashboard:', error);
    } finally {
      setIsCreating(false);
    }
  }, [createDashboard, setActiveDashboard, sendStreamMessage, isCreating, activeConversation?.id]);

  const handleStartWithTemplate = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('Create from template was clicked');
  }, []);

  // Don't show when there's no conversation or when a dashboard already exists for it.
  // When loaded is false (e.g. after remount when conversationId updates), existingDashboard is
  // null so we keep showing the buttons instead of flashing them away.
  if (!activeConversation?.id || existingDashboard) {
    return null;
  }

  return (
    <Grid hasGutter>
      <GridItem span={6}>
        <Card isClickable variant="secondary">
          <CardHeader
            selectableActions={{
              onClickAction: handleStartWithTemplate,
            }}
          >
            <RhUiCatalogIcon />
          </CardHeader>
          <CardTitle>Start with a template</CardTitle>
          <CardBody>
            Select a pre-built, best-practice dashboard for common scenarios like cluster health or
            vulnerability monitoring. It&apos;s the fastest way to get insights.
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card isClickable variant="secondary" isDisabled={isCreating}>
          <CardHeader
            selectableActions={{
              onClickAction: handleStartFromScratch,
            }}
          >
            <RhUiCatalogIcon />
          </CardHeader>
          <CardTitle>Start from scratch</CardTitle>
          <CardBody>
            Start with a completely blank canvas and build a fully custom dashboard. This is ideal
            when you have a specific, unique monitoring goal in mind.
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};
