import React from 'react';
import { type ToolCallState } from './useToolCalls';
import { ToolResultCard } from './ToolResultCard';

export interface ToolCallsListProps {
  toolCalls: ToolCallState[];
}

/**
 * Format tool name for display (e.g., "resources_list" -> "Resources List")
 */
const formatToolName = (name: string): string => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ToolCallsList: React.FunctionComponent<ToolCallsListProps> = ({
  toolCalls,
}) => {
  if (toolCalls.length === 0) return null;

  return (
    <>
      {toolCalls.map((tool) => {
        const isRunning = tool.status === 'running';
        const displayName = formatToolName(tool.name);

        const resultString =
          tool.result !== undefined
            ? typeof tool.result === 'string'
              ? tool.result
              : JSON.stringify(tool.result, null, 2)
            : undefined;

        return (
          <ToolResultCard
            key={tool.id}
            toolId={tool.id}
            displayName={displayName}
            arguments={tool.arguments}
            resultString={resultString}
            isLoading={isRunning}
          />
        );
      })}
    </>
  );
};
