import { mergeToolCallsWithResults, getToolCallsFromMessage } from './toolCallHelpers';
import type { Message } from '../hooks/AIState';
import type { GenieAdditionalProperties } from '../types/chat';
import * as toolResultParsers from './toolResultParsers';

// Mock the parseToolResultToArtifacts function
jest.mock('./toolResultParsers', () => ({
  parseToolResultToArtifacts: jest.fn(() => []),
}));

const mockParseToolResultToArtifacts =
  toolResultParsers.parseToolResultToArtifacts as jest.MockedFunction<
    typeof toolResultParsers.parseToolResultToArtifacts
  >;

// Helper to create tool call events
const createToolCallEvent = (id: string, name: string, args: Record<string, unknown> = {}) => ({
  event: 'tool_call' as const,
  data: {
    id,
    name,
    args,
    type: 'function',
  },
});

// Helper to create tool result events
const createToolResultEvent = (
  id: string,
  status: 'success' | 'failure',
  content: string,
  round = 1,
) => ({
  event: 'tool_result' as const,
  data: {
    id,
    status,
    content,
    type: 'function',
    round,
  },
});

describe('mergeToolCallsWithResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to return empty array by default
    mockParseToolResultToArtifacts.mockReturnValue([]);
  });

  it('returns empty array when both tool calls and results are undefined', () => {
    const result = mergeToolCallsWithResults(undefined, undefined);

    expect(result).toEqual([]);
  });

  it('returns empty array when both tool calls and results are empty', () => {
    const result = mergeToolCallsWithResults([], []);

    expect(result).toEqual([]);
  });

  it('returns running status for tool calls without results', () => {
    const toolCalls = [
      createToolCallEvent('call-1', 'search', { query: 'test' }),
      createToolCallEvent('call-2', 'fetch_data', { url: 'http://example.com' }),
    ];

    const result = mergeToolCallsWithResults(toolCalls, undefined);

    expect(result).toEqual([
      {
        id: 'call-1',
        name: 'search',
        status: 'running',
        arguments: { query: 'test' },
      },
      {
        id: 'call-2',
        name: 'fetch_data',
        status: 'running',
        arguments: { url: 'http://example.com' },
      },
    ]);
  });

  it('merges tool calls with matching results by ID', () => {
    const toolCalls = [createToolCallEvent('call-1', 'search', { query: 'test' })];
    const toolResults = [createToolResultEvent('call-1', 'success', 'Search results here')];

    const result = mergeToolCallsWithResults(toolCalls, toolResults);

    expect(result).toEqual([
      {
        id: 'call-1',
        name: 'search',
        status: 'success',
        arguments: { query: 'test' },
        result: 'Search results here',
        artifacts: [],
      },
    ]);
  });

  it('handles mixed running and completed tool calls', () => {
    const toolCalls = [
      createToolCallEvent('call-1', 'search', { query: 'first' }),
      createToolCallEvent('call-2', 'fetch', { url: 'test.com' }),
      createToolCallEvent('call-3', 'analyze', { data: 'sample' }),
    ];
    const toolResults = [
      createToolResultEvent('call-1', 'success', 'First result'),
      createToolResultEvent('call-3', 'failure', 'Analysis failed'),
    ];

    const result = mergeToolCallsWithResults(toolCalls, toolResults);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: 'call-1',
      name: 'search',
      status: 'success',
      arguments: { query: 'first' },
      result: 'First result',
      artifacts: [],
    });
    expect(result[1]).toEqual({
      id: 'call-2',
      name: 'fetch',
      status: 'running',
      arguments: { url: 'test.com' },
    });
    expect(result[2]).toEqual({
      id: 'call-3',
      name: 'analyze',
      status: 'failure',
      arguments: { data: 'sample' },
      result: 'Analysis failed',
      artifacts: [],
    });
  });

  it('preserves failure status from result', () => {
    const toolCalls = [createToolCallEvent('call-1', 'risky_operation', {})];
    const toolResults = [createToolResultEvent('call-1', 'failure', 'Operation failed')];

    const result = mergeToolCallsWithResults(toolCalls, toolResults);

    expect(result[0].status).toBe('failure');
    expect(result[0].result).toBe('Operation failed');
  });

  it('calls parseToolResultToArtifacts for completed tool calls', () => {
    const mockArtifacts = [
      { id: 'artifact-1', type: 'widget' as const, widget: {} as never, createdAt: new Date() },
    ];
    mockParseToolResultToArtifacts.mockReturnValue(mockArtifacts);

    const toolCalls = [createToolCallEvent('call-1', 'generate_ui', { prompt: 'create button' })];
    const toolResults = [createToolResultEvent('call-1', 'success', '{"blocks":[]}')];

    const result = mergeToolCallsWithResults(toolCalls, toolResults);

    expect(mockParseToolResultToArtifacts).toHaveBeenCalledWith('generate_ui', '{"blocks":[]}');
    expect(result[0].artifacts).toEqual(mockArtifacts);
  });

  it('does not call parseToolResultToArtifacts for running tool calls', () => {
    const toolCalls = [createToolCallEvent('call-1', 'search', {})];

    mergeToolCallsWithResults(toolCalls, []);

    expect(mockParseToolResultToArtifacts).not.toHaveBeenCalled();
  });

  it('returns empty array when tool calls is undefined but results exist', () => {
    const toolResults = [createToolResultEvent('call-1', 'success', 'result')];

    const result = mergeToolCallsWithResults(undefined, toolResults);

    // Results without matching calls are ignored
    expect(result).toEqual([]);
  });

  it('handles empty arguments object', () => {
    const toolCalls = [createToolCallEvent('call-1', 'no_args_tool', {})];
    const toolResults = [createToolResultEvent('call-1', 'success', 'done')];

    const result = mergeToolCallsWithResults(toolCalls, toolResults);

    expect(result[0].arguments).toEqual({});
  });

  it('preserves order of tool calls', () => {
    const toolCalls = [
      createToolCallEvent('call-3', 'third', {}),
      createToolCallEvent('call-1', 'first', {}),
      createToolCallEvent('call-2', 'second', {}),
    ];

    const result = mergeToolCallsWithResults(toolCalls, []);

    expect(result.map((tc) => tc.id)).toEqual(['call-3', 'call-1', 'call-2']);
  });
});

describe('getToolCallsFromMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to return empty array by default
    mockParseToolResultToArtifacts.mockReturnValue([]);
  });

  const createMessage = (
    additionalAttributes?: GenieAdditionalProperties,
  ): Message<GenieAdditionalProperties> => ({
    id: 'msg-1',
    role: 'bot',
    answer: 'Test message',
    date: new Date('2024-01-01'),
    additionalAttributes,
  });

  it('returns empty array when message has no additionalAttributes', () => {
    const message = createMessage(undefined);

    const result = getToolCallsFromMessage(message);

    expect(result).toEqual([]);
  });

  it('returns empty array when additionalAttributes has no tool calls', () => {
    const message = createMessage({});

    const result = getToolCallsFromMessage(message);

    expect(result).toEqual([]);
  });

  it('extracts tool calls from message additionalAttributes', () => {
    const message = createMessage({
      toolCalls: [createToolCallEvent('call-1', 'search', { query: 'test' })],
      toolResults: [createToolResultEvent('call-1', 'success', 'Found results')],
    });

    const result = getToolCallsFromMessage(message);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'call-1',
      name: 'search',
      status: 'success',
      arguments: { query: 'test' },
      result: 'Found results',
      artifacts: [],
    });
  });

  it('handles message with tool calls but no results', () => {
    const message = createMessage({
      toolCalls: [createToolCallEvent('call-1', 'long_running_task', {})],
    });

    const result = getToolCallsFromMessage(message);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('running');
  });

  it('handles multiple tool calls in a single message', () => {
    const message = createMessage({
      toolCalls: [
        createToolCallEvent('call-1', 'tool_a', {}),
        createToolCallEvent('call-2', 'tool_b', {}),
        createToolCallEvent('call-3', 'tool_c', {}),
      ],
      toolResults: [
        createToolResultEvent('call-1', 'success', 'Result A'),
        createToolResultEvent('call-2', 'failure', 'Error B'),
      ],
    });

    const result = getToolCallsFromMessage(message);

    expect(result).toHaveLength(3);
    expect(result[0].status).toBe('success');
    expect(result[1].status).toBe('failure');
    expect(result[2].status).toBe('running');
  });
});
