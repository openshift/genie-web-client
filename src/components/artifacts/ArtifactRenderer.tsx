import React from 'react';
import type { Artifact } from '../../types/chat';
import type { ToolCallState } from '../../utils/toolCallHelpers';
import { WidgetRenderer } from './WidgetRenderer';
import { WidgetArtifactRenderer } from './WidgetArtifactRenderer';

export interface ArtifactRendererProps {
  artifacts: Artifact[];
  /** Tool calls from the message, used to look up query args for Perses components */
  toolCalls?: ToolCallState[];
}

/**
 * Renders a list of artifacts from a chat message.
 * Dispatches to specialized renderers based on artifact type.
 */
export const ArtifactRenderer: React.FunctionComponent<ArtifactRendererProps> = ({
  artifacts,
  toolCalls,
}) => {
  if (artifacts.length === 0) {
    return null;
  }

  return (
    <>
      {artifacts.map((artifact) => {
        switch (artifact.type) {
          case 'widget':
            return (
              <WidgetArtifactRenderer key={artifact.id} artifact={artifact} toolCalls={toolCalls} />
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

          default:
            return null;
        }
      })}
    </>
  );
};
