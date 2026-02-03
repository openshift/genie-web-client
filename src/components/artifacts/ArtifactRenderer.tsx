import React from 'react';
import type { Artifact } from '../../types/chat';
import type { ToolCallState } from '../../utils/toolCallHelpers';
import { WidgetRenderer } from './WidgetRenderer';

export interface ArtifactRendererProps {
  artifacts: Artifact[];
  /** Tool calls from the message, used to look up query args for Perses components */
  toolCalls?: ToolCallState[];
}

export const ArtifactRenderer: React.FunctionComponent<ArtifactRendererProps> = ({
  artifacts,
  toolCalls,
}) => {
  // DEBUG: Log artifacts and toolCalls
  console.log('[ArtifactRenderer] Rendering:', {
    artifactsCount: artifacts.length,
    artifacts: artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      widget: a.type === 'widget' ? a.widget : undefined,
    })),
    toolCallsCount: toolCalls?.length ?? 0,
    toolCalls: toolCalls?.map((tc) => ({ name: tc.name, args: tc.arguments })) ?? [],
  });

  if (artifacts.length === 0) {
    return null;
  }

  return (
    <>
      {artifacts.map((artifact) => {
        switch (artifact.type) {
          case 'widget':
            return (
              <WidgetRenderer key={artifact.id} widget={artifact.widget} toolCalls={toolCalls} />
            );

          case 'dashboard':
            // Future: Implement dashboard renderer
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

          default: {
            return null;
          }
        }
      })}
    </>
  );
};
