import React, { useState, useCallback } from 'react';
import type { Artifact, WidgetArtifact } from '../../types/chat';
import type { ToolCallState } from '../../utils/toolCallHelpers';
import type { AladdinDashboard } from '../../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useActiveDashboard } from '../../hooks/useActiveDashboard';
import { DashboardSelectorModal } from '../dashboard';

export interface ArtifactRendererProps {
  artifacts: Artifact[];
  /** Tool calls from the message, used to look up query args for Perses components */
  toolCalls?: ToolCallState[];
  /** Namespace for dashboard operations */
  namespace?: string;
}

export const ArtifactRenderer: React.FunctionComponent<ArtifactRendererProps> = ({
  artifacts,
  toolCalls,
  namespace = 'default',
}) => {
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [pendingWidget, setPendingWidget] = useState<WidgetArtifact | null>(null);

  const { addWidgetToDashboard, hasActiveDashboard } = useActiveDashboard(namespace);

  const handleAddToDashboard = useCallback(
    async (artifact: WidgetArtifact) => {
      if (!toolCalls) {
        console.warn('[ArtifactRenderer] No tool calls available for persistence');
        return;
      }

      // If there's an active dashboard, add directly
      if (hasActiveDashboard) {
        try {
          await addWidgetToDashboard(artifact, toolCalls);
        } catch (error) {
          console.error('[ArtifactRenderer] Failed to add widget to dashboard:', error);
        }
        return;
      }

      // Otherwise, open the selector modal
      setPendingWidget(artifact);
      setIsSelectorModalOpen(true);
    },
    [toolCalls, hasActiveDashboard, addWidgetToDashboard],
  );

  const handleSelectorClose = useCallback(() => {
    setIsSelectorModalOpen(false);
    setPendingWidget(null);
  }, []);

  const handleDashboardSelect = useCallback(
    async (dashboard: AladdinDashboard) => {
      setIsSelectorModalOpen(false);

      // Add the pending widget to the selected dashboard directly
      // (passing dashboard explicitly to avoid React state timing issues)
      if (pendingWidget && toolCalls) {
        try {
          await addWidgetToDashboard(pendingWidget, toolCalls, dashboard);
        } catch (error) {
          console.error('[ArtifactRenderer] Failed to add widget to dashboard:', error);
        }
      }

      setPendingWidget(null);
    },
    [pendingWidget, toolCalls, addWidgetToDashboard],
  );

  if (artifacts.length === 0) {
    return null;
  }

  return (
    <>
      {artifacts.map((artifact) => {
        switch (artifact.type) {
          case 'widget':
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

      <DashboardSelectorModal
        isOpen={isSelectorModalOpen}
        onClose={handleSelectorClose}
        onSelect={handleDashboardSelect}
        namespace={namespace}
      />
    </>
  );
};
