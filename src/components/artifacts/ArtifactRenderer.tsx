import React from 'react';
import type { Artifact } from '../../types/chat';
import { WidgetRenderer } from './WidgetRenderer';

export interface ArtifactRendererProps {
  artifacts: Artifact[];
}

export const ArtifactRenderer: React.FunctionComponent<ArtifactRendererProps> = ({ artifacts }) => {
  if (artifacts.length === 0) {
    return null;
  }

  return (
    <>
      {artifacts.map((artifact) => {
        switch (artifact.type) {
          case 'widget':
            return <WidgetRenderer key={artifact.id} widget={artifact.widget} />;

          case 'dashboard':
            // Future: Implement dashboard renderer
            return (
              <div key={artifact.id}>
                <p>Dashboard: {artifact.widgets.length} widgets</p>
                {artifact.widgets.map((widget) => (
                  <WidgetRenderer key={widget.id} widget={widget} />
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
