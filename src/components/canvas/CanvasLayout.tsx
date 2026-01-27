import type { ReactNode } from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import './CanvasLayout.css';

export interface CanvasLayoutProps {
  /** Content to render in the sticky toolbar section */
  toolbar: ReactNode;
  /** Content to render in the sticky footer section */
  footer: ReactNode;
  /** Main scrollable content area */
  children: ReactNode;
}

export const CanvasLayout: React.FC<CanvasLayoutProps> = ({ toolbar, footer, children }) => {
  return (
    <Stack hasGutter className="canvas-layout">
      <StackItem className="canvas-layout__toolbar">{toolbar}</StackItem>
      <StackItem isFilled className="canvas-layout__content">
        {children}
      </StackItem>
      <StackItem className="canvas-layout__footer">{footer}</StackItem>
    </Stack>
  );
};
