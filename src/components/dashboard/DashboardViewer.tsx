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
import type { AladdinDashboard, DashboardPanel, ToolCall } from '../../types/dashboard';
import type { NGUIWidget } from '../../types/chat';
import type { ToolCallState } from '../../utils/toolCallHelpers';
import { WidgetRenderer } from '../artifacts/WidgetRenderer';
import { parseToolResultToArtifacts } from '../../utils/toolResultParsers';

export interface DashboardViewerProps {
  /** The dashboard to render */
  dashboard: AladdinDashboard;
}

/**
 * Convert stored ToolCall[] to ToolCallState[] for WidgetRenderer.
 * WidgetRenderer expects the runtime format with 'name' instead of 'tool'.
 */
function convertToolCallsForRenderer(toolCalls: ToolCall[]): ToolCallState[] {
  return toolCalls.map((tc) => ({
    id: tc.id,
    name: tc.tool,
    status: 'success' as const,
    arguments: tc.arguments,
    result: tc.result,
    // Re-parse artifacts from result if it's a generate_ui tool
    artifacts: tc.result ? parseToolResultToArtifacts(tc.tool, tc.result) : undefined,
  }));
}

/**
 * Extract the NGUIWidget from a panel's stored tool calls.
 * Looks for a generate_ui tool call and parses its result to get the widget spec.
 */
function extractWidgetFromPanel(panel: DashboardPanel): NGUIWidget | null {
  // First, try to get widget from component config (stored directly)
  if (panel.component.config && Object.keys(panel.component.config).length > 0) {
    return {
      id: `widget-${panel.id}`,
      type: 'ngui',
      spec: panel.component.config,
      createdAt: new Date(),
    };
  }

  // Fallback: parse from generate_ui tool result
  const generateUICall = panel.dataSource.toolCalls.find(
    (tc) => tc.tool.toLowerCase().includes('generate_ui') && tc.result,
  );

  if (generateUICall?.result) {
    const artifacts = parseToolResultToArtifacts(generateUICall.tool, generateUICall.result);
    const widgetArtifact = artifacts.find((a) => a.type === 'widget');
    if (widgetArtifact && widgetArtifact.type === 'widget') {
      return widgetArtifact.widget as NGUIWidget;
    }
  }

  return null;
}

/**
 * Renders a single dashboard panel in a card.
 */
const DashboardPanelCard: React.FunctionComponent<{ panel: DashboardPanel }> = ({ panel }) => {
  const widget = useMemo(() => extractWidgetFromPanel(panel), [panel]);
  const toolCalls = useMemo(
    () => convertToolCallsForRenderer(panel.dataSource.toolCalls),
    [panel.dataSource.toolCalls],
  );

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
        <WidgetRenderer widget={widget} toolCalls={toolCalls} />
      </CardBody>
    </Card>
  );
};

/**
 * Renders an AladdinDashboard in a grid layout.
 * Each panel is rendered based on its position and component configuration.
 */
export const DashboardViewer: React.FunctionComponent<DashboardViewerProps> = ({ dashboard }) => {
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
          // Convert grid position to PatternFly grid span
          // PatternFly Grid uses a 12-column system by default
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
