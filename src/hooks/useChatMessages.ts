import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Message, ToolCallEvent, ToolResultEvent } from './AIState';
import {
  useMessages,
  useStreamChunk,
  useInProgress,
  useSendStreamMessage,
} from './AIState';
import type { Artifact, GenieAdditionalProperties } from '../types/chat';
import { parseToolResultToArtifacts } from '../utils/toolResultParsers';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Throttle interval for streaming content updates (in milliseconds) */
const STREAMING_THROTTLE_MS = 50;

// =============================================================================
// TOOL CALL TYPES & HELPERS
// =============================================================================

export interface ToolCallState {
  id: number;
  name: string;
  status: 'running' | 'completed';
  arguments?: Record<string, unknown>;
  result?: unknown;
  artifacts?: Artifact[];
}

/**
 * Check if a tool call event is complete (has tool_name in token)
 */
function isCompleteToolCall(call: ToolCallEvent): boolean {
  const token = call.data?.token;
  return typeof token === 'object' && token !== null && 'tool_name' in token;
}

/**
 * Extract and transform tool calls from a message's additionalAttributes.
 * This processes the raw toolCalls and toolResults arrays from the library
 * and combines them into a unified ToolCallState array.
 */
export function getToolCallsFromMessage(
  message: Message<GenieAdditionalProperties>,
): ToolCallState[] {
  const rawToolCalls = message.additionalAttributes?.toolCalls as ToolCallEvent[] | undefined;
  const rawToolResults = message.additionalAttributes?.toolResults as ToolResultEvent[] | undefined;

  if (!rawToolCalls?.length && !rawToolResults?.length) {
    return [];
  }

  const toolCallsMap = new Map<number, ToolCallState>();

  // Process tool calls
  if (rawToolCalls) {
    rawToolCalls.forEach((call) => {
      if (!isCompleteToolCall(call)) return;

      const callId = call.data?.id;
      if (callId === undefined) return;

      const tokenData = call.data?.token as { tool_name: string; arguments?: Record<string, unknown> };

      toolCallsMap.set(callId, {
        id: callId,
        name: tokenData.tool_name,
        status: 'running',
        arguments: tokenData.arguments,
      });
    });
  }

  // Process tool results and update matching calls
  if (rawToolResults) {
    rawToolResults.forEach((result) => {
      const resultId = result.data?.id;
      if (resultId === undefined) return;

      const tokenData = result.data?.token as { tool_name?: string; response?: unknown };
      const existingCall = toolCallsMap.get(resultId);

      const toolName = existingCall?.name || tokenData?.tool_name || 'Unknown tool';
      const artifacts = parseToolResultToArtifacts(toolName, tokenData?.response);

      toolCallsMap.set(resultId, {
        id: resultId,
        name: toolName,
        status: 'completed',
        arguments: existingCall?.arguments,
        result: tokenData?.response,
        artifacts,
      });
    });
  }

  return Array.from(toolCallsMap.values());
}

// =============================================================================
// STREAMING MESSAGE TYPE
// =============================================================================

export interface StreamingMessage {
  /** The message ID being streamed */
  messageId: string;
  /** Accumulated content (throttled updates) */
  content: string;
  /** Tool calls for this message */
  toolCalls: ToolCallState[];
}

// =============================================================================
// HOOK RETURN TYPE
// =============================================================================

export interface UseChatMessagesReturn {
  /** Array of completed messages from the conversation */
  messages: Message<GenieAdditionalProperties>[];
  /** Current streaming message data (null if not streaming) */
  streamingMessage: StreamingMessage | null;
  /** Whether a message is currently being streamed */
  isStreaming: boolean;
  /** Send a new message */
  sendMessage: (text: string) => void;
  /** Index of the last user message (-1 if none) */
  lastUserMessageIndex: number;
  /** Index of the last bot message (-1 if none) */
  lastBotMessageIndex: number;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Custom hook that manages chat messages with optimized streaming updates.
 * 
 * This hook solves the re-render problem by:
 * 1. Accumulating streaming content in refs (no re-renders)
 * 2. Throttling state updates to every STREAMING_THROTTLE_MS milliseconds
 * 3. Separating streaming message state from completed messages
 * 
 * The message's `date` property (from the AI state library) is used for timestamps,
 * which remains stable throughout streaming.
 * 
 * @returns Chat messages state and utilities
 */
export function useChatMessages(): UseChatMessagesReturn {
  // ==========================================================================
  // RAW STATE FROM AI STATE LIBRARY
  // ==========================================================================
  const messages = useMessages() as Message<GenieAdditionalProperties>[];
  const rawStreamChunk = useStreamChunk<GenieAdditionalProperties>();
  const inProgress = useInProgress();
  const sendStreamMessage = useSendStreamMessage();


  // ==========================================================================
  // STREAMING MESSAGE STATE (throttled updates)
  // ==========================================================================
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);

  // ==========================================================================
  // REFS FOR ACCUMULATION (no re-renders when updated)
  // ==========================================================================
  
  /** Accumulated content from stream chunks */
  const accumulatedContentRef = useRef<string>('');
  
  /** Current message ID being streamed */
  const currentMessageIdRef = useRef<string | null>(null);
  
  /** Pending timeout for throttled update */
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  /** Tool calls accumulated during streaming */
  const accumulatedToolCallsRef = useRef<ToolCallState[]>([]);
  
  /** Processed tool call IDs to avoid duplicates */
  const processedToolCallIdsRef = useRef<Set<number>>(new Set());
  
  /** Processed tool result IDs to avoid duplicates */
  const processedToolResultIdsRef = useRef<Set<number>>(new Set());

  // ==========================================================================
  // HELPER: Flush accumulated content to state
  // ==========================================================================
  const flushToState = useCallback(() => {
    if (currentMessageIdRef.current) {
      setStreamingMessage({
        messageId: currentMessageIdRef.current,
        content: accumulatedContentRef.current,
        toolCalls: [...accumulatedToolCallsRef.current],
      });
    }
    updateTimeoutRef.current = null;
  }, []);

  // ==========================================================================
  // HELPER: Schedule throttled update
  // ==========================================================================
  const scheduleUpdate = useCallback(() => {
    if (!updateTimeoutRef.current) {
      updateTimeoutRef.current = setTimeout(flushToState, STREAMING_THROTTLE_MS);
    }
  }, [flushToState]);

  // ==========================================================================
  // PROCESS STREAM CHUNKS
  // ==========================================================================
  useEffect(() => {
    if (!rawStreamChunk) return;

    const messageId = rawStreamChunk.messageId;
    if (!messageId) return;

    // Check if this is a new message (different ID)
    if (currentMessageIdRef.current !== messageId) {
      // Clear any pending update for the old message
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      // Reset refs for new message
      currentMessageIdRef.current = messageId;
      accumulatedContentRef.current = '';
      accumulatedToolCallsRef.current = [];
      processedToolCallIdsRef.current.clear();
      processedToolResultIdsRef.current.clear();
    }

    // The library already accumulates content in rawStreamChunk.answer
    // We just store the latest value
    if (rawStreamChunk.answer) {
      accumulatedContentRef.current = rawStreamChunk.answer;
    }

    // Process tool calls
    const toolCalls = rawStreamChunk.additionalAttributes?.toolCalls as ToolCallEvent[] | undefined;
    const toolResults = rawStreamChunk.additionalAttributes?.toolResults as ToolResultEvent[] | undefined;

    if (toolCalls) {
      toolCalls.forEach((call) => {
        if (!isCompleteToolCall(call)) return;

        const callId = call.data?.id;
        if (callId === undefined || processedToolCallIdsRef.current.has(callId)) return;

        const tokenData = call.data?.token as { tool_name: string; arguments?: Record<string, unknown> };
        processedToolCallIdsRef.current.add(callId);

        accumulatedToolCallsRef.current.push({
          id: callId,
          name: tokenData.tool_name,
          status: 'running',
          arguments: tokenData.arguments,
        });
      });
    }

    if (toolResults) {
      toolResults.forEach((result) => {
        const resultId = result.data?.id;
        if (resultId === undefined || processedToolResultIdsRef.current.has(resultId)) return;

        const tokenData = result.data?.token as { tool_name?: string; response?: unknown };
        processedToolResultIdsRef.current.add(resultId);

        const callIndex = accumulatedToolCallsRef.current.findIndex(
          (c) => c.id === resultId && c.status === 'running',
        );

        const toolName = callIndex !== -1
          ? accumulatedToolCallsRef.current[callIndex].name
          : (tokenData?.tool_name || 'Unknown tool');

        const artifacts = parseToolResultToArtifacts(toolName, tokenData?.response);

        if (callIndex !== -1) {
          accumulatedToolCallsRef.current[callIndex] = {
            ...accumulatedToolCallsRef.current[callIndex],
            status: 'completed',
            result: tokenData?.response,
            artifacts,
          };
        } else {
          accumulatedToolCallsRef.current.push({
            id: resultId,
            name: toolName,
            status: 'completed',
            result: tokenData?.response,
            artifacts,
          });
        }
      });
    }

    // Schedule throttled update
    scheduleUpdate();
  }, [rawStreamChunk, scheduleUpdate]);

  // ==========================================================================
  // HANDLE STREAMING END
  // ==========================================================================
  useEffect(() => {
    if (!inProgress && currentMessageIdRef.current) {
      // Streaming ended - flush any remaining content immediately
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      // Clear streaming state
      setStreamingMessage(null);
      currentMessageIdRef.current = null;
      accumulatedContentRef.current = '';
      accumulatedToolCallsRef.current = [];
      processedToolCallIdsRef.current.clear();
      processedToolResultIdsRef.current.clear();
    }
  }, [inProgress]);

  // ==========================================================================
  // CLEANUP ON UNMOUNT
  // ==========================================================================
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================
  const lastUserMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role !== 'bot') {
        return i;
      }
    }
    return -1;
  }, [messages]);

  const lastBotMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'bot') {
        return i;
      }
    }
    return -1;
  }, [messages]);

  // ==========================================================================
  // SEND MESSAGE WRAPPER
  // ==========================================================================
  const sendMessage = useCallback(
    (text: string) => {
      sendStreamMessage(text);
    },
    [sendStreamMessage],
  );

  // ==========================================================================
  // RETURN
  // ==========================================================================
  return {
    messages,
    streamingMessage,
    isStreaming: inProgress,
    sendMessage,
    lastUserMessageIndex,
    lastBotMessageIndex,
  };
}

