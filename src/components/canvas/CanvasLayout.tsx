import type { ReactNode } from 'react';
import './CanvasLayout.css';

export interface CanvasLayoutProps {
  /** Content to render in the sticky toolbar section */
  toolbar: ReactNode;
  /** Content to render in the sticky footer section */
  footer: ReactNode;
  /** Main scrollable content area */
  children: ReactNode;
}

export const CanvasLayout: React.FC<CanvasLayoutProps> = ({
  toolbar,
  footer,
  children,
}) => {
  return (
    <div className="canvas-layout">
      <div className="canvas-layout__toolbar">{toolbar}</div>
      <div className="canvas-layout__content">{children}</div>
      <div className="canvas-layout__footer">{footer}</div>
    </div>
  );
};

