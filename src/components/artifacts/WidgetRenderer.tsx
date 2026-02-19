import React, { Suspense } from 'react';
import DynamicComponent from '@rhngui/patternfly-react-renderer';
import { Spinner } from '@patternfly/react-core';
import type { Widget } from '../../types/chat';
import type { BasePersesProps } from '../../types/perses';
import { isPersesComponent, getPersesComponent } from '../perses/componentRegistry';

export interface WidgetRendererProps {
  widget: Widget;
}

/**
 * Extract Perses props from widget spec.
 * Uses dataTypeMetadata (from NGUI configuration) as the primary source,
 * falling back to direct spec values.
 */
function extractPersesProps(spec: Record<string, unknown>): BasePersesProps {
  const metadata = spec.dataTypeMetadata as Record<string, unknown> | undefined;
  const source = metadata ?? spec;

  return {
    query: String(source.query ?? spec.query ?? ''),
    duration: String(source.duration ?? spec.duration ?? '1h'),
    step: String(source.step ?? spec.step ?? '1m'),
    start: (source.start as string | undefined) ?? (spec.start as string | undefined),
    end: (source.end as string | undefined) ?? (spec.end as string | undefined),
  };
}

/**
 * Renders a Widget based on its type.
 * For NGUI widgets, checks if the component is a Perses component and renders it
 * with props from dataTypeMetadata. Otherwise, uses DynamicComponent.
 */
export const WidgetRenderer: React.FunctionComponent<WidgetRendererProps> = ({ widget }) => {
  if (widget.type !== 'ngui') {
    return null;
  }

  const componentName = widget.spec.component as string | undefined;

  // Check if this is a registered Perses component
  if (componentName && isPersesComponent(componentName)) {
    const persesProps = extractPersesProps(widget.spec);
    const Component = getPersesComponent(componentName);

    return (
      <Suspense fallback={<Spinner aria-label="Loading chart..." />}>
        <Component key={widget.id} {...persesProps} />
      </Suspense>
    );
  }

  // Default: render via DynamicComponent
  return <DynamicComponent key={widget.id} config={widget.spec} />;
};
