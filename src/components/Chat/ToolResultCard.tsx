import React, { useState } from 'react';
import { ToolResponse } from '@patternfly/chatbot';
import { Spinner } from '@patternfly/react-core';

export interface ToolResultCardProps {
  toolId: number | string;
  displayName: string;
  arguments?: Record<string, unknown>;
  resultString?: string;
  isLoading?: boolean;
}

export const ToolResultCard: React.FunctionComponent<ToolResultCardProps> = ({
  toolId,
  displayName,
  arguments: toolArguments,
  resultString,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ToolResponse
      key={toolId}
      toggleContent={
        <span>
          {isLoading && (
            <Spinner size="sm" />
          )}
          {isLoading ? `Executing: ${displayName}` : `Tool Response: ${displayName}`}
        </span>
      }
      body={
        <>
          {toolArguments && (
            <div>
              <strong>Arguments:</strong> {JSON.stringify(toolArguments)}
            </div>
          )}
          {isLoading ? (
            <div>
              <Spinner size="md" />
              <span>Executing: {displayName}...</span>
            </div>
          ) : resultString ? (
            <div>
              <strong>Result:</strong> {resultString}
            </div>
          ) : null}
        </>
      }
      expandableSectionProps={{
        isExpanded,
        onToggle: (_event, expanded) => setIsExpanded(expanded),
      }}
    />
  );
};
