import React from 'react';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { useChatConversationContext } from '../../hooks/useChatConversation';
import { Dashboard } from '../dashboard';
import { isAladdinDashboard } from '../../utils/artifactTypeGuards';

/**
 * Renders the appropriate content based on the active artifact type.
 */
export const CanvasContent: React.FunctionComponent = () => {
  const { activeArtifact } = useChatConversationContext();

  if (!activeArtifact) {
    return (
      <EmptyState titleText="No content" headingLevel="h4">
        <EmptyStateBody>No content to display.</EmptyStateBody>
      </EmptyState>
    );
  }

  if (isAladdinDashboard(activeArtifact)) {
    return <Dashboard dashboard={activeArtifact} />;
  }

  return (
    <EmptyState titleText="Unsupported content" headingLevel="h4">
      <EmptyStateBody>This artifact type is not yet supported.</EmptyStateBody>
    </EmptyState>
  );
};
