import React from 'react';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { useChatConversationContext, type ActiveArtifact } from '../../hooks/useChatConversation';
import { DashboardViewer } from '../dashboard';
import type { AladdinDashboard } from '../../types/dashboard';

/**
 * Type guard to check if artifact is an AladdinDashboard (K8s resource).
 */
function isAladdinDashboard(artifact: ActiveArtifact): artifact is AladdinDashboard {
  return artifact !== null && 'kind' in artifact && artifact.kind === 'AladdinDashboard';
}

/**
 * Type guard to check if artifact is a CodeArtifact.
 */
function isCodeArtifact(
  artifact: ActiveArtifact,
): artifact is { type: 'code'; id: string; createdAt: Date } {
  return artifact !== null && 'type' in artifact && artifact.type === 'code';
}

/**
 * Renders the appropriate content in the canvas based on the active artifact type.
 * This is a generic dispatcher that routes to specialized viewers.
 */
export const CanvasContent: React.FunctionComponent = () => {
  const { activeArtifact } = useChatConversationContext();

  // No active artifact - show empty state
  if (!activeArtifact) {
    return (
      <EmptyState titleText="No content" headingLevel="h4">
        <EmptyStateBody>Add widgets to a dashboard to view them here.</EmptyStateBody>
      </EmptyState>
    );
  }

  // Dashboard artifact
  if (isAladdinDashboard(activeArtifact)) {
    return <DashboardViewer dashboard={activeArtifact} />;
  }

  // Code artifact (placeholder for future implementation)
  if (isCodeArtifact(activeArtifact)) {
    return (
      <EmptyState titleText="Code Viewer" headingLevel="h4">
        <EmptyStateBody>Code artifact rendering coming soon.</EmptyStateBody>
      </EmptyState>
    );
  }

  // Unknown artifact type - show fallback
  return (
    <EmptyState titleText="Unsupported content" headingLevel="h4">
      <EmptyStateBody>This artifact type is not yet supported.</EmptyStateBody>
    </EmptyState>
  );
};
