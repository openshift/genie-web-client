import React, { useMemo } from 'react';
import {
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import type { AladdinDashboard, DashboardPanel } from '../../types/dashboard';
import type { NGUIWidget } from '../../types/chat';
import { WidgetRenderer } from '../artifacts/WidgetRenderer';

export interface DashboardProps {
  dashboard: AladdinDashboard;
}

/**
 * Extracts NGUIWidget from a panel's component config.
 */
function extractWidgetFromPanel(panel: DashboardPanel): NGUIWidget | null {
  if (panel.component.config && Object.keys(panel.component.config).length > 0) {
    return {
      id: (panel.component.config.widgetId as string) ?? `widget-${panel.id}`,
      type: 'ngui',
      spec: panel.component.config,
      createdAt: new Date(),
    };
  }

  return null;
}

const DashboardPanelCard: React.FunctionComponent<{ panel: DashboardPanel }> = ({ panel }) => {
  const widget = useMemo(() => extractWidgetFromPanel(panel), [panel]);

  if (!widget) {
    return (
      <Card isFullHeight>
        <CardHeader>
          <CardTitle>{panel.title ?? 'Panel'}</CardTitle>
        </CardHeader>
        <CardBody>
          <EmptyState>
            <EmptyStateBody>Unable to render widget</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card isFullHeight>
      {panel.title ? (
        <CardHeader>
          <CardTitle>{panel.title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardBody>
        <WidgetRenderer widget={widget} />
      </CardBody>
    </Card>
  );
};

export const Dashboard: React.FunctionComponent<DashboardProps> = ({ dashboard }) => {
  const panels = dashboard.spec.layout.panels ?? [];
  const columns = dashboard.spec.layout.columns ?? 12;

  if (panels.length === 0) {
    return (
      <EmptyState titleText="No panels" headingLevel="h4">
        <EmptyStateBody>
          This dashboard has no panels yet. Add widgets from chat to populate it.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>{dashboard.spec.title}</h2>
      {dashboard.spec.description ? (
        <p style={{ marginBottom: '16px', color: 'var(--pf-v5-global--Color--200)' }}>
          {dashboard.spec.description}
        </p>
      ) : null}
      <Grid hasGutter>
        {panels.map((panel) => {
          const span = Math.round((panel.position.width / columns) * 12);
          const clampedSpan = Math.max(1, Math.min(12, span)) as
            | 1
            | 2
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
            | 9
            | 10
            | 11
            | 12;

          return (
            <GridItem key={panel.id} span={clampedSpan}>
              <DashboardPanelCard panel={panel} />
            </GridItem>
          );
        })}
      </Grid>
    </div>
  );
};
