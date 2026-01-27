import {
  isGenerateUITool,
  parseGenerateUIResult,
  parseToolResultToArtifacts,
} from './toolResultParsers';
import type { WidgetArtifact } from '../types/chat';

describe('isGenerateUITool', () => {
  it('returns true for exact "generate_ui" name', () => {
    expect(isGenerateUITool('generate_ui')).toBe(true);
  });

  it('returns true for "generate_ui" with suffix', () => {
    expect(isGenerateUITool('generate_ui_v2')).toBe(true);
    expect(isGenerateUITool('generate_ui_button')).toBe(true);
  });

  it('returns true for "generate_ui" with prefix', () => {
    expect(isGenerateUITool('mcp_generate_ui')).toBe(true);
    expect(isGenerateUITool('custom_generate_ui')).toBe(true);
  });

  it('returns true for case-insensitive matches', () => {
    expect(isGenerateUITool('Generate_UI')).toBe(true);
    expect(isGenerateUITool('GENERATE_UI')).toBe(true);
    expect(isGenerateUITool('GenerateUI')).toBe(false); // no underscore
  });

  it('returns false for unrelated tool names', () => {
    expect(isGenerateUITool('search')).toBe(false);
    expect(isGenerateUITool('fetch_data')).toBe(false);
    expect(isGenerateUITool('ui_generator')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isGenerateUITool('')).toBe(false);
  });
});

describe('parseGenerateUIResult', () => {
  // Suppress console warnings/errors during tests
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns empty array for non-string input', () => {
    expect(parseGenerateUIResult(null)).toEqual([]);
    expect(parseGenerateUIResult(undefined)).toEqual([]);
    expect(parseGenerateUIResult(123)).toEqual([]);
    expect(parseGenerateUIResult({ blocks: [] })).toEqual([]);
  });

  it('returns empty array for invalid JSON string', () => {
    expect(parseGenerateUIResult('not valid json')).toEqual([]);
    expect(parseGenerateUIResult('{ broken')).toEqual([]);
  });

  it('returns empty array when blocks is not an array', () => {
    expect(parseGenerateUIResult('{"blocks": "not an array"}')).toEqual([]);
    expect(parseGenerateUIResult('{"blocks": null}')).toEqual([]);
    expect(parseGenerateUIResult('{"noBlocks": true}')).toEqual([]);
  });

  it('returns empty array for empty blocks array', () => {
    expect(parseGenerateUIResult('{"blocks": []}')).toEqual([]);
  });

  it('parses valid generate_ui response with single block', () => {
    const nguiConfig = { type: 'button', label: 'Click me' };
    const response = JSON.stringify({
      blocks: [
        {
          rendering: {
            content: JSON.stringify(nguiConfig),
          },
        },
      ],
    });

    const result = parseGenerateUIResult(response) as WidgetArtifact[];

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('widget');
    expect(result[0].widget.type).toBe('ngui');
    expect(result[0].widget.spec).toEqual(nguiConfig);
  });

  it('parses valid generate_ui response with multiple blocks', () => {
    const response = JSON.stringify({
      blocks: [
        { rendering: { content: JSON.stringify({ type: 'button' }) } },
        { rendering: { content: JSON.stringify({ type: 'input' }) } },
        { rendering: { content: JSON.stringify({ type: 'card' }) } },
      ],
    });

    const result = parseGenerateUIResult(response) as WidgetArtifact[];

    expect(result).toHaveLength(3);
    expect(result[0].widget.spec.type).toBe('button');
    expect(result[1].widget.spec.type).toBe('input');
    expect(result[2].widget.spec.type).toBe('card');
  });

  it('skips blocks with missing rendering.content', () => {
    const response = JSON.stringify({
      blocks: [
        { rendering: { content: JSON.stringify({ type: 'valid' }) } },
        { rendering: {} }, // missing content
        { noRendering: true }, // missing rendering
        { rendering: { content: JSON.stringify({ type: 'also_valid' }) } },
      ],
    });

    const result = parseGenerateUIResult(response) as WidgetArtifact[];

    expect(result).toHaveLength(2);
    expect(result[0].widget.spec.type).toBe('valid');
    expect(result[1].widget.spec.type).toBe('also_valid');
  });

  it('skips blocks with invalid JSON in content', () => {
    const response = JSON.stringify({
      blocks: [
        { rendering: { content: 'not json' } },
        { rendering: { content: JSON.stringify({ type: 'valid' }) } },
      ],
    });

    const result = parseGenerateUIResult(response) as WidgetArtifact[];

    expect(result).toHaveLength(1);
    expect(result[0].widget.spec.type).toBe('valid');
  });

  it('creates unique IDs for each artifact and widget', () => {
    const response = JSON.stringify({
      blocks: [
        { rendering: { content: JSON.stringify({ type: 'a' }) } },
        { rendering: { content: JSON.stringify({ type: 'b' }) } },
      ],
    });

    const result = parseGenerateUIResult(response) as WidgetArtifact[];

    expect(result[0].id).not.toBe(result[1].id);
    expect(result[0].widget.id).not.toBe(result[1].widget.id);
  });

  it('sets createdAt dates on artifacts and widgets', () => {
    const response = JSON.stringify({
      blocks: [{ rendering: { content: JSON.stringify({ type: 'test' }) } }],
    });

    const result = parseGenerateUIResult(response) as WidgetArtifact[];

    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].widget.createdAt).toBeInstanceOf(Date);
  });
});

describe('parseToolResultToArtifacts', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses generate_ui tool results', () => {
    const response = JSON.stringify({
      blocks: [{ rendering: { content: JSON.stringify({ type: 'button' }) } }],
    });

    const result = parseToolResultToArtifacts('generate_ui', response);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('widget');
  });

  it('parses generate_ui variants', () => {
    const response = JSON.stringify({
      blocks: [{ rendering: { content: JSON.stringify({ type: 'button' }) } }],
    });

    expect(parseToolResultToArtifacts('generate_ui_v2', response)).toHaveLength(1);
    expect(parseToolResultToArtifacts('mcp_generate_ui', response)).toHaveLength(1);
    expect(parseToolResultToArtifacts('GENERATE_UI', response)).toHaveLength(1);
  });

  it('returns empty array for unknown tools', () => {
    const response = '{"data": "some result"}';

    expect(parseToolResultToArtifacts('search', response)).toEqual([]);
    expect(parseToolResultToArtifacts('fetch_data', response)).toEqual([]);
    expect(parseToolResultToArtifacts('unknown_tool', response)).toEqual([]);
  });

  it('returns empty array for null/undefined results', () => {
    expect(parseToolResultToArtifacts('generate_ui', null)).toEqual([]);
    expect(parseToolResultToArtifacts('generate_ui', undefined)).toEqual([]);
  });
});
