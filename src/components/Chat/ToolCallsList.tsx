import type { FunctionComponent } from 'react';
import type { ToolCallState } from '../../hooks/useChatMessages';
import { ToolCalls } from './ToolCalls';

export interface ToolCallsListProps {
  toolCalls: ToolCallState[];
}

/**
 * Renders a "Tools" button that opens a drawer with the list of all tool calls.
 */
export const ToolCallsList: FunctionComponent<ToolCallsListProps> = ({ toolCalls }) => {
  if (toolCalls.length === 0) return null;

  return <ToolCalls toolCalls={toolCalls} />;
};
