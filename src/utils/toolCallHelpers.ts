import type { Message } from '../hooks/AIState';
import type { Artifact, GenieAdditionalProperties } from '../types/chat';
import { parseToolResultToArtifacts } from './toolResultParsers';

export interface ToolCallState {
  id: string;
  name: string;
  /** 'running' while waiting for result, or status from API ('success' | 'failure') */
  status: 'running' | 'success' | 'failure';
  arguments?: Record<string, unknown>;
  result?: string;
  artifacts?: Artifact[];
}

// https://github.com/lightspeed-core/lightspeed-stack/blob/main/docs/openapi.md#toolcallsummary
interface ToolCallEvent {
  event: 'tool_call';
  data: {
    id: string;
    name: string;
    args: Record<string, unknown>;
    type: string;
  };
}

// https://github.com/lightspeed-core/lightspeed-stack/blob/main/docs/openapi.md#toolresultsummary
interface ToolResultEvent {
  event: 'tool_result';
  data: {
    id: string;
    status: 'success' | 'failure';
    content: string;
    type: string;
    round: number;
  };
}

/**
 * Merge tool calls with their matching results by ID.
 * - Tool calls without a result get status 'running'
 * - Tool calls with a result get the status from the API ('success' | 'failure')
 */
export function mergeToolCallsWithResults(
  rawToolCalls: ToolCallEvent[] | undefined,
  rawToolResults: ToolResultEvent[] | undefined,
): ToolCallState[] {
  if (!rawToolCalls?.length && !rawToolResults?.length) {
    return [];
  }

  const resultsById = new Map<string, ToolResultEvent>();
  if (rawToolResults) {
    for (const result of rawToolResults) {
      resultsById.set(result.data.id, result);
    }
  }

  const toolCalls: ToolCallState[] = [];

  // Process each tool call and merge with its result if available
  if (rawToolCalls) {
    for (const call of rawToolCalls) {
      const { id, name, args } = call.data;
      const matchingResult = resultsById.get(id);

      if (matchingResult) {
        const { status, content } = matchingResult.data;
        const artifacts = parseToolResultToArtifacts(name, content);

        toolCalls.push({
          id,
          name,
          status,
          arguments: args,
          result: content,
          artifacts,
        });
      } else {
        // No result yet - still running
        toolCalls.push({
          id,
          name,
          status: 'running',
          arguments: args,
        });
      }
    }
  }

  return toolCalls;
}

/**
 * Extract and transform tool calls from a message's additionalAttributes.
 */
export function getToolCallsFromMessage(
  message: Message<GenieAdditionalProperties>,
): ToolCallState[] {
  const rawToolCalls = message.additionalAttributes?.toolCalls as ToolCallEvent[] | undefined;
  const rawToolResults = message.additionalAttributes?.toolResults as ToolResultEvent[] | undefined;
  return mergeToolCallsWithResults(rawToolCalls, rawToolResults);
}
