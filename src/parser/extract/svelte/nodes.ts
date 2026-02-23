/**
 * This file contains functions to extract nodes from Vue SFC AST
 * 
 * For Vue, we need to extract:
 * 1. The defineMeta function call from <script setup>
 * 2. Story component usages from <template>
 */

import type { VueSfcAst } from '../../ast.js';
import { DEFINE_META_FUNCTION, STORY_COMPONENT } from '../../../constants.js';

export interface StoryNode {
  name: string;
  exportName?: string;
  props: Record<string, any>;
  template?: string;
}

export interface DefineMetaNode {
  properties: Record<string, any>;
  renderTemplate?: string;
}

export interface ExtractedSvelteNodes {
  defineMeta: DefineMetaNode | null;
  stories: StoryNode[];
}

/**
 * Extract nodes from Vue SFC AST
 * 
 * NOTE: This is a simplified version. In a full implementation,
 * you would use @vue/compiler-sfc's compileScript to get the script AST
 * and parse the template for Story components.
 */
export async function extractSvelteASTNodes({
  ast,
  filename,
}: {
  ast: VueSfcAst;
  filename: string;
}): Promise<ExtractedSvelteNodes> {
  const { descriptor } = ast;
  
  // Extract from script or script setup
  const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content || '';
  
  // Simple regex-based extraction (in production, use proper AST parsing)
  const defineMeta = extractDefineMeta(scriptContent);
  const stories = extractStories(descriptor);

  return {
    defineMeta,
    stories,
  };
}

/**
 * Extract defineMeta call from script content
 */
function extractDefineMeta(scriptContent: string): DefineMetaNode | null {
  const defineMetaRegex = /const\s*\{\s*Story\s*\}\s*=\s*defineMeta\s*\(\s*(\{[\s\S]*?\})\s*\)/;
  const match = scriptContent.match(defineMetaRegex);
  
  if (!match) {
    return null;
  }

  // Parse the object literal (simplified - in production use AST parsing)
  try {
    const objStr = match[1];
    return {
      properties: parseObjectLiteral(objStr),
    };
  } catch {
    return { properties: {} };
  }
}

/**
 * Extract Story components from template
 */
function extractStories(descriptor: VueSfcAst['descriptor']): StoryNode[] {
  const template = descriptor.template?.content || '';
  const stories: StoryNode[] = [];
  
  // Match Story component tags
  const storyRegex = /<Story\s+([^>]*)\/?>/g;
  let match;
  
  while ((match = storyRegex.exec(template)) !== null) {
    const attrs = match[1];
    const props: Record<string, any> = {};
    
    // Extract name attribute
    const nameMatch = attrs.match(/name\s*=\s*["']([^"']+)["']/);
    if (nameMatch) {
      props.name = nameMatch[1];
    }
    
    // Extract exportName attribute
    const exportNameMatch = attrs.match(/exportName\s*=\s*["']([^"']+)["']/);
    if (exportNameMatch) {
      props.exportName = exportNameMatch[1];
    }
    
    // Extract args attribute
    const argsMatch = attrs.match(/:args\s*=\s*(\{[^}]*\})/);
    if (argsMatch) {
      try {
        props.args = JSON.parse(argsMatch[1].replace(/'/g, '"'));
      } catch {
        props.args = {};
      }
    }
    
    // Check for asChild prop
    if (attrs.includes('asChild')) {
      props.asChild = true;
    }
    
    stories.push({
      name: props.name || 'Unnamed',
      exportName: props.exportName,
      props,
    });
  }
  
  return stories;
}

/**
 * Simple object literal parser (very basic)
 */
function parseObjectLiteral(str: string): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Match key-value pairs
  const pairs = str.match(/(\w+)\s*:\s*([^,\n]+)/g);
  
  if (pairs) {
    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split(':');
      const value = valueParts.join(':').trim();
      const cleanKey = key.trim();
      
      try {
        result[cleanKey] = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        result[cleanKey] = value;
      }
    }
  }
  
  return result;
}
