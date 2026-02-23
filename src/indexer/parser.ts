/**
 * Parser utilities for the indexer
 * 
 * This file provides additional parsing helpers for extracting
 * story information from Vue SFC files.
 */

import type { SFCParseResult } from '@vue/compiler-sfc';
import type { StoryAnnotations, Meta } from '../types.js';

/**
 * Parse meta information from Vue SFC
 */
export function parseMeta(descriptor: SFCParseResult['descriptor']): Meta {
  const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content || '';
  
  // Extract defineMeta call
  const defineMetaMatch = scriptContent.match(/defineMeta\s*\(\s*(\{[\s\S]*?\})\s*\)/);
  
  if (!defineMetaMatch) {
    return {};
  }

  try {
    // This is a simplified parsing - in production, use proper AST parsing
    const metaObj = eval(`(${defineMetaMatch[1]})`);
    return metaObj;
  } catch {
    return {};
  }
}

/**
 * Parse all stories from Vue SFC template
 */
export function parseStories(descriptor: SFCParseResult['descriptor']): StoryAnnotations[] {
  const template = descriptor.template?.content || '';
  const stories: StoryAnnotations[] = [];
  
  // Find all Story components
  const storyRegex = /<Story\s+([^>]+)\/>/g;
  let match;
  
  while ((match = storyRegex.exec(template)) !== null) {
    const attrs = match[1];
    const story: StoryAnnotations = {};
    
    // Extract name
    const nameMatch = attrs.match(/name\s*=\s*["']([^"']+)["']/);
    if (nameMatch) {
      story.name = nameMatch[1];
    }
    
    // Extract exportName
    const exportNameMatch = attrs.match(/exportName\s*=\s*["']([^"']+)["']/);
    if (exportNameMatch) {
      story.exportName = exportNameMatch[1];
    }
    
    stories.push(story);
  }
  
  return stories;
}

/**
 * Generate the index entry for a stories file
 */
export function generateIndexEntry(
  fileName: string,
  meta: Meta,
  stories: StoryAnnotations[]
): string {
  const title = meta.title || fileName;
  const exports = stories.map((s) => s.exportName || s.name || 'Unnamed');
  
  return `
export default ${JSON.stringify({ ...meta, title })};
${exports.map((e) => `export const ${e} = {};`).join('\n')}
  `.trim();
}
