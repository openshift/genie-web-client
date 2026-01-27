import type { ReactNode } from 'react';
import { Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
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

/**
 * CanvasToolbar (GIE-77 layout-only) – Three-slot toolbar layout for the Canvas frame.
 *
 * - Left slot: align start, grows to fill space
 * - Center slot: centered actions
 * - Right slot: align end
 *
 * Slot content and behavior are implemented in GIE-78, GIE-340, GIE-342, GIE-344, GIE-346.
 * Full toolbar implementation is preserved in branch GIE-77-full-toolbar-wip.
 */
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
          <ToolbarItem className="canvas-toolbar__spacer" />
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
