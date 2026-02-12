import type { ActiveArtifact } from '../hooks/useChatConversation';
import type { AladdinDashboard } from '../types/dashboard';
import type { CodeArtifact } from '../types/chat';

export function isAladdinDashboard(artifact: ActiveArtifact): artifact is AladdinDashboard {
  return artifact !== null && 'kind' in artifact && artifact.kind === 'AladdinDashboard';
}

export function isCodeArtifact(artifact: ActiveArtifact): artifact is CodeArtifact {
  return artifact !== null && 'type' in artifact && artifact.type === 'code';
}
