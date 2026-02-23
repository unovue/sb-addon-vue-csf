/**
 * Parser utilities for the indexer
 *
 * This file provides additional parsing helpers for extracting
 * story information from Vue SFC files.
 */

import type { SFCParseResult } from '@vue/compiler-sfc'
import type { Meta, StoryAnnotations } from '../types.js'

/**
 * Parse meta information from Vue SFC
 */
export function parseMeta(descriptor: SFCParseResult['descriptor']): Meta {
  const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content || ''

  // Extract defineMeta call
  const defineMetaMatch = /defineMeta\s*\(\s*(\{[\s\S]*?\})\s*\)/.exec(scriptContent)

  if (!defineMetaMatch) {
    return {}
  }

  try {
    // Parse as JSON by converting single quotes to double quotes
    // This is a simplified parsing - in production, use proper AST parsing
    const jsonStr = defineMetaMatch[1]
      .replace(/'/g, '"')
      .replace(/(\w+):/g, '"$1":')
    return JSON.parse(jsonStr) as Meta
  }
  catch {
    return {}
  }
}

/**
 * Parse all stories from Vue SFC template
 */
export function parseStories(descriptor: SFCParseResult['descriptor']): StoryAnnotations[] {
  const template = descriptor.template?.content || ''
  const stories: StoryAnnotations[] = []

  // Find all Story components - using safer regex pattern
  const storyRegex = /<Story\s([^>]*)\/>/g
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = storyRegex.exec(template)) !== null) {
    const attrs = match[1] || ''
    const story: StoryAnnotations = {}

    // Extract name
    const nameMatch = /name\s*=\s*["']([^"']+)["']/.exec(attrs)
    if (nameMatch) {
      story.name = nameMatch[1]
    }

    // Extract exportName
    const exportNameMatch = /exportName\s*=\s*["']([^"']+)["']/.exec(attrs)
    if (exportNameMatch) {
      story.exportName = exportNameMatch[1]
    }

    stories.push(story)
  }

  return stories
}

/**
 * Generate the index entry for a stories file
 */
export function generateIndexEntry(
  fileName: string,
  meta: Meta,
  stories: StoryAnnotations[],
): string {
  const title = meta.title || fileName
  const exports = stories.map(s => s.exportName || s.name || 'Unnamed')

  return `
export default ${JSON.stringify({ ...meta, title })};
${exports.map(e => `export const ${e} = {};`).join('\n')}
  `.trim()
}
