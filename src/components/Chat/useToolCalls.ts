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
// Supports TWO formats:
//
// V1 format (legacy):
//   { id: 52, token: { tool_name: "resources_list", arguments: {...} } }
//   { event: "tool_result", id: 52, token: { tool_name: "resources_list", response: "..." } }
//
// V2 format (Responses API):
//   { id: "mcp_call_xxx", name: "resources_list", args: {...}, type: "mcp_call" }
//   { event: "tool_result", id: "mcp_call_xxx", status: "success", content: "...", type: "mcp_call" }
// =============================================================================

export interface ToolCallState {
  id: number | string;
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
 * Check if a tool call event is complete
 * V1: has tool_name in token object
 * V2: has name directly in data
 */
function isCompleteToolCall(call: ToolCallEvent): boolean {
  const data = call.data;
  if (!data) return false;

  // V2 format: name is directly on data
  if ('name' in data && typeof data.name === 'string') {
    return true;
  }

  // V1 format: tool_name is nested in token object
  const token = data.token;
  return typeof token === 'object' && token !== null && 'tool_name' in token;
}

/**
 * Extract tool name and arguments from a tool call event (supports both V1 and V2 formats)
 */
function extractToolCallData(call: ToolCallEvent): {
  id: number | string;
  name: string;
  arguments?: Record<string, unknown>;
} | null {
  const data = call.data;
  if (!data) return null;

  // V2 format: { id: "xxx", name: "tool_name", args: {...}, type: "..." }
  if ('name' in data && typeof data.name === 'string') {
    return {
      id: data.id,
      name: data.name,
      arguments: (data as Record<string, unknown>).args as Record<string, unknown> | undefined,
    };
  }

  // V1 format: { id: 52, token: { tool_name: "...", arguments: {...} } }
  const token = data.token as
    | { tool_name: string; arguments?: Record<string, unknown> }
    | undefined;
  if (token && typeof token === 'object' && 'tool_name' in token) {
    return {
      id: data.id,
      name: token.tool_name,
      arguments: token.arguments,
    };
  }

  return null;
}

export function useToolCalls(
  streamChunk: IStreamChunk<LightSpeedCoreAdditionalProperties> | undefined,
): UseToolCallsResult {
  const [toolCallsByMessage, setToolCallsByMessage] = useState<Record<string, ToolCallState[]>>({});

  // Track which tool call IDs we've already processed to avoid duplicates
  const processedToolCallIds = useRef<Set<number | string>>(new Set());
  const processedToolResultIds = useRef<Set<number | string>>(new Set());

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

      // Process COMPLETE tool calls only (those with tool_name or name)
      if (toolCalls) {
        toolCalls.forEach((call) => {
          // Skip partial streaming tokens - only process complete tool calls
          if (!isCompleteToolCall(call)) return;

          const extracted = extractToolCallData(call);
          if (!extracted) return;

          const { id: callId, name, arguments: args } = extracted;

          // Skip if we've already processed this tool call
          if (processedToolCallIds.current.has(callId)) return;

          // Add new complete tool call
          processedToolCallIds.current.add(callId);
          hasUpdates = true;

          updatedCalls.push({
            id: callId,
            name,
            status: 'running',
            arguments: args,
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

          // Extract result data - supports both V1 and V2 formats
          // V1: { token: { tool_name: "...", response: "..." } }
          // V2: { id: "...", status: "success", content: "...", type: "..." }
          const data = result.data as Record<string, unknown>;
          const token = data?.token as { tool_name?: string; response?: unknown } | undefined;

          // Get response from V1 format (token.response) or V2 format (content)
          const responseContent = token?.response ?? data?.content;
          // Get tool name from V1 format (token.tool_name) or V2 format (type or look up from existing call)
          const resultToolName = token?.tool_name ?? (data?.type as string | undefined);

          processedToolResultIds.current.add(resultId);
          hasUpdates = true;

          // Find matching tool call and update it (keeping arguments)
          const callIndex = updatedCalls.findIndex(
            (c) => c.id === resultId && c.status === 'running',
          );

          // Parse artifacts from the tool result
          const toolName =
            callIndex !== -1 ? updatedCalls[callIndex].name : resultToolName || 'Unknown tool';

          const artifacts = parseToolResultToArtifacts(toolName, responseContent);

          if (callIndex !== -1) {
            // Update existing call - keep arguments, add result and artifacts, change status
            updatedCalls[callIndex] = {
              ...updatedCalls[callIndex],
              status: 'completed',
              result: responseContent,
              artifacts,
              // arguments are preserved from the original entry
            };
          } else {
            // Result arrived before/without a matching call (edge case)
            updatedCalls.push({
              id: resultId,
              name: toolName,
              status: 'completed',
              result: responseContent,
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
