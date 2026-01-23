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
 * Parse a generate_ui tool result into WidgetArtifacts
 *
 * The generate_ui tool returns a response with blocks, each containing
 * an NGUI component configuration that can be rendered dynamically.
 */
export function parseGenerateUIResult(response: unknown): Artifact[] {
  if (typeof response !== 'string') {
    return [];
  }

  try {
    const parsedResponse = JSON.parse(response);
    const blocks = parsedResponse?.blocks;

    if (!Array.isArray(blocks)) {
      return [];
    }

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
 * Parse a tool result into Artifacts based on the tool name
 *
 * This is the main entry point for parsing tool results.
 * Add new tool parsers here as they are implemented.
 */
export function parseToolResultToArtifacts(toolName: string, result: unknown): Artifact[] {
  if (isGenerateUITool(toolName)) {
    return parseGenerateUIResult(result);
  }

  // Future: Add more parsers here
  // if (toolName === 'create_dashboard') {
  //   return parseDashboardResult(result);
  // }

  // No artifacts for unknown tools
  return [];
}
