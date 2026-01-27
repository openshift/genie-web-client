import type { ReactNode } from 'react';
import { Toolbar, ToolbarContent, ToolbarGroup } from '@patternfly/react-core';
import './CanvasToolbar.css';

export interface CanvasToolbarProps {
  /** Content for the left slot (e.g. toggle, artifact switcher, title) */
  left?: ReactNode;
  /** Content for the center slot (e.g. version actions, time controls) */
  center?: ReactNode;
  /** Content for the right slot (e.g. overflow menu, close) */
  right?: ReactNode;
  /** Optional class name for the toolbar container */
  className?: string;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  left,
  center,
  right,
  className = '',
}) => {
  return (
    <div className="canvas-toolbar__wrapper">
      <Toolbar className={`canvas-toolbar ${className}`.trim()}>
        <ToolbarContent>
          <ToolbarGroup align={{ default: 'alignStart' }} className="canvas-toolbar__left-slot">
            {left}
          </ToolbarGroup>
          <ToolbarGroup variant="action-group" className="canvas-toolbar__center-slot">
            {center}
          </ToolbarGroup>
          <ToolbarGroup align={{ default: 'alignEnd' }} className="canvas-toolbar__right-slot">
            {right}
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    </div>
  );
};
