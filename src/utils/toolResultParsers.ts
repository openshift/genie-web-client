/**
 * Tool Result Parsers
 *
 * This module contains functions to parse tool call results into Artifact objects.
 * Each tool type that produces renderable artifacts has its own parser function.
 */

import type { Artifact, WidgetArtifact, NGUIWidget } from '../types/chat';

/**
 * Check if a tool name is a generate_ui tool
 * Handles various naming formats: generate_ui, generate_ui_xxx, mcp_generate_ui, etc.
 */
export function isGenerateUITool(toolName: string): boolean {
  const normalizedName = toolName.toLowerCase();
  return normalizedName.startsWith('generate_ui') || normalizedName.includes('generate_ui');
}

/**
 * Extract blocks from a tool result payload.
 * Handles generate_ui format (top-level blocks) and ngui format (blocks under ngui key).
 */
function getBlocksFromPayload(payload: unknown): unknown[] | null {
  const getBlocks = (obj: Record<string, unknown>): unknown[] | null => {
    if (Array.isArray(obj.blocks)) return obj.blocks;
    const ngui = obj.ngui as Record<string, unknown> | undefined;
    if (ngui && ngui.blocks) console.log('ngui.blocks', ngui.blocks);
    if (ngui && Array.isArray(ngui.blocks)) return ngui.blocks;
    return null;
  };

  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      return getBlocks(parsed);
    } catch {
      return null;
    }
  }
  if (payload && typeof payload === 'object' && payload !== null) {
    return getBlocks(payload as Record<string, unknown>);
  }
  return null;
}

/**
 * Parse a generate_ui tool result into WidgetArtifacts
 *
 * The generate_ui tool returns a response with blocks, each containing
 * an NGUI component configuration that can be rendered dynamically.
 * Also handles content with ngui.blocks (e.g. CVE lookup tools).
 */
export function parseGenerateUIResult(response: unknown): Artifact[] {
  const blocks = getBlocksFromPayload(response);
  if (!blocks?.length) {
    return [];
  }

  try {
    return blocks
      .map((block: unknown, index: number): WidgetArtifact | null => {
        try {
          const blockObj = block as { rendering?: { content?: string } };
          const contentString = blockObj?.rendering?.content;

          if (typeof contentString !== 'string') {
            console.warn('Block missing rendering.content:', block);
            return null;
          }

          const nguiConfig = JSON.parse(contentString);

          const widget: NGUIWidget = {
            id: `ngui-widget-${Date.now()}-${index}`,
            type: 'ngui',
            spec: nguiConfig,
            createdAt: new Date(),
          };

          return {
            id: `widget-artifact-${Date.now()}-${index}`,
            type: 'widget',
            widget,
            createdAt: new Date(),
          };
        } catch (blockError) {
          console.error('Failed to parse NGUI block:', blockError);
          return null;
        }
      })
      .filter((artifact): artifact is WidgetArtifact => artifact !== null);
  } catch (error) {
    console.error('Failed to parse generate_ui response:', error);
    return [];
  }
}

/**
 * Parse a tool result into Artifacts based on the payload shape.
 *
 * Parses any result with blocks (structuredContent from MCP or generate_ui format).
 */
export function parseToolResultToArtifacts(_toolName: string, result: unknown): Artifact[] {
  return parseGenerateUIResult(result);
}
