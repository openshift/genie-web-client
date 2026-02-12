import React from 'react';
import { useChatConversationContext } from '../../hooks/useChatConversation';
import { DashboardCanvasToolbar } from '../dashboard';
import { isAladdinDashboard } from '../../utils/artifactTypeGuards';

/**
 * Renders the appropriate toolbar based on the active artifact type.
 */
export const CanvasToolbarContent: React.FunctionComponent = () => {
  const { activeArtifact } = useChatConversationContext();

  if (isAladdinDashboard(activeArtifact)) {
    return <DashboardCanvasToolbar />;
  }

  return null;
};
