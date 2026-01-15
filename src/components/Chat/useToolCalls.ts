import { useState, useEffect, useRef } from 'react';
import type {
  IStreamChunk,
  LightSpeedCoreAdditionalProperties,
  ToolCallEvent,
  ToolResultEvent,
} from '../../hooks/AIState';
import type { Artifact } from '../../types/chat';
import { parseToolResultToArtifacts } from '../../utils/toolResultParsers';

// =============================================================================
// TOOL CALLS HOOK
// =============================================================================
// Handles tool calls and results during streaming.
//
// IMPORTANT: Tool calls stream in multiple events:
// - Events with just token strings (e.g., "admin", "kind") are partial tokens
//   building up the tool call arguments - we IGNORE these
// - Only events where token contains `tool_name` are COMPLETE tool calls
// - Tool results have the same `id` as their corresponding complete tool call
//
// Example stream:
//   { id: 36, token: "admin" }        <- partial, ignore
//   { id: 37, token: "kind" }         <- partial, ignore
//   ...
//   { id: 52, token: { tool_name: "resources_list", arguments: {...} } } <- COMPLETE
//   { event: "tool_result", id: 52, token: { tool_name: "resources_list", response: "..." } }
// =============================================================================

export interface ToolCallState {
  id: number;
  name: string;
  status: 'running' | 'completed';
  arguments?: Record<string, unknown>;
  result?: unknown;
  artifacts?: Artifact[];
}

export interface UseToolCallsResult {
  toolCallsByMessage: Record<string, ToolCallState[]>;
}

/**
 * Check if a tool call event is complete (has tool_name in token)
 */
function isCompleteToolCall(call: ToolCallEvent): boolean {
  const token = call.data?.token;
  return typeof token === 'object' && token !== null && 'tool_name' in token;
}

export function useToolCalls(
  streamChunk: IStreamChunk<LightSpeedCoreAdditionalProperties> | undefined,
): UseToolCallsResult {
  const [toolCallsByMessage, setToolCallsByMessage] = useState<Record<string, ToolCallState[]>>({});

  // Track which tool call IDs we've already processed to avoid duplicates
  const processedToolCallIds = useRef<Set<number>>(new Set());
  const processedToolResultIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!streamChunk?.messageId) return;

    const messageId = streamChunk.messageId;
    const toolCalls = streamChunk.additionalAttributes?.toolCalls as ToolCallEvent[] | undefined;
    const toolResults = streamChunk.additionalAttributes?.toolResults as
      | ToolResultEvent[]
      | undefined;

    let hasUpdates = false;

    setToolCallsByMessage((prev) => {
      const existingCalls = prev[messageId] || [];
      const updatedCalls = [...existingCalls];

      // Process COMPLETE tool calls only (those with tool_name)
      if (toolCalls) {
        toolCalls.forEach((call) => {
          // Skip partial streaming tokens - only process complete tool calls
          if (!isCompleteToolCall(call)) return;

          const callId = call.data?.id;
          if (callId === undefined) return;

          // Skip if we've already processed this tool call
          if (processedToolCallIds.current.has(callId)) return;

          const token = call.data?.token as {
            tool_name: string;
            arguments?: Record<string, unknown>;
          };

          // Add new complete tool call
          processedToolCallIds.current.add(callId);
          hasUpdates = true;

          updatedCalls.push({
            id: callId,
            name: token.tool_name,
            status: 'running',
            arguments: token.arguments,
          });
        });
      }

      // Process tool results - update the existing call entry with the result
      // This keeps the arguments AND adds the result to the same entry
      if (toolResults) {
        toolResults.forEach((result) => {
          const resultId = result.data?.id;
          if (resultId === undefined) return;

          // Skip if we've already processed this result
          if (processedToolResultIds.current.has(resultId)) return;

          const token = result.data?.token as { tool_name?: string; response?: unknown };
          processedToolResultIds.current.add(resultId);
          hasUpdates = true;

          // Find matching tool call and update it (keeping arguments)
          const callIndex = updatedCalls.findIndex(
            (c) => c.id === resultId && c.status === 'running',
          );

          // Parse artifacts from the tool result
          const toolName =
            callIndex !== -1 ? updatedCalls[callIndex].name : token?.tool_name || 'Unknown tool';

          const artifacts = parseToolResultToArtifacts(toolName, token?.response);

          if (callIndex !== -1) {
            // Update existing call - keep arguments, add result and artifacts, change status
            updatedCalls[callIndex] = {
              ...updatedCalls[callIndex],
              status: 'completed',
              result: token?.response,
              artifacts,
              // arguments are preserved from the original entry
            };
          } else {
            // Result arrived before/without a matching call (edge case)
            updatedCalls.push({
              id: resultId,
              name: toolName,
              status: 'completed',
              result: token?.response,
              artifacts,
            });
          }
        });
      }

      // Only return new object if we actually made changes
      if (!hasUpdates) return prev;

      return {
        ...prev,
        [messageId]: updatedCalls,
      };
    });
  }, [streamChunk]);

  // Reset processed IDs when stream chunk message ID changes (new message)
  const prevMessageId = useRef<string | undefined>();
  useEffect(() => {
    if (streamChunk?.messageId !== prevMessageId.current) {
      processedToolCallIds.current.clear();
      processedToolResultIds.current.clear();
      prevMessageId.current = streamChunk?.messageId;
    }
  }, [streamChunk?.messageId]);

  return { toolCallsByMessage };
}
