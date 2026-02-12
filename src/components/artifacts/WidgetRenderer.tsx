import React, { Suspense } from 'react';
import DynamicComponent from '@rhngui/patternfly-react-renderer';
import { Spinner } from '@patternfly/react-core';
import type { Widget } from '../../types/chat';
import type { ToolCallState } from '../../utils/toolCallHelpers';
import type { BasePersesProps } from '../../types/perses';
import { isPersesComponent, getPersesComponent } from '../perses/componentRegistry';

export interface WidgetRendererProps {
  widget: Widget;
  /** Tool calls from the message, used to look up query args for Perses components */
  toolCalls?: ToolCallState[];
}

/**
 * Find matching tool call by name and return its arguments.
 * Returns the most recent (last) matching tool call when multiple exist.
 */
function findToolCallArgs(
  toolCalls: ToolCallState[] | undefined,
  inputDataType: string | undefined,
): Record<string, unknown> | undefined {
  if (!toolCalls || !inputDataType) {
    return undefined;
  }

  const matchingCalls = toolCalls.filter((toolCall) => toolCall.name === inputDataType);

  return matchingCalls.length > 0 ? matchingCalls[matchingCalls.length - 1].arguments : undefined;
}

/**
 * Extract Perses props from widget spec and tool call args.
 * Tool call args take priority over spec values.
 */
function extractPersesProps(
  spec: Record<string, unknown>,
  toolCallArgs: Record<string, unknown> | undefined,
): BasePersesProps {
  const source = toolCallArgs ?? spec;

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
 * with args from the matching tool call. Otherwise, uses DynamicComponent.
 */
export const WidgetRenderer: React.FunctionComponent<WidgetRendererProps> = ({
  widget,
  toolCalls,
}) => {
  if (widget.type !== 'ngui') {
    return null;
  }

  const componentName = widget.spec.component as string | undefined;

  // Check if this is a registered Perses component
  if (componentName && isPersesComponent(componentName)) {
    const inputDataType = widget.spec.input_data_type as string | undefined;
    /***
     * This is a temporary solution to get the tool call args for the perses component.
     * In the future, we will use the tool call args directly from NGUI:
     * https://issues.redhat.com/browse/NGUI-448
     */
    const toolCallArgs = findToolCallArgs(toolCalls, inputDataType);
    const persesProps = extractPersesProps(widget.spec, toolCallArgs);

    console.log('[WidgetRenderer] Rendering Perses component:', {
      componentName,
      inputDataType,
      foundToolCallArgs: !!toolCallArgs,
      toolCallArgs,
      persesProps,
    });

    const Component = getPersesComponent(componentName);

    return (
      <Suspense fallback={<Spinner aria-label="Loading chart..." />}>
        <Component key={widget.id} {...persesProps} />
      </Suspense>
    );
  }

  // Default: render via DynamicComponent
  console.log('[WidgetRenderer] Falling back to DynamicComponent');
  return <DynamicComponent key={widget.id} config={widget.spec} />;
};
