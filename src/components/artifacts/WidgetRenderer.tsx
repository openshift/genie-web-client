import React from 'react';
import DynamicComponent from '@rhngui/patternfly-react-renderer';
import type { Widget } from '../../types/chat';

export interface WidgetRendererProps {
  widget: Widget;
}

/**
 * Renders a Widget based on its type. 
 * Currently supports NGUI widgets only.
 */
export const WidgetRenderer: React.FunctionComponent<WidgetRendererProps> = ({
  widget,
}) => {
  switch (widget.type) {
    case 'ngui':
      return <DynamicComponent key={widget.id} config={widget.spec} />;
    default:
      return null;
  }
};

