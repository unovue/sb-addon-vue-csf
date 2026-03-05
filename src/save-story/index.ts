/**
 * Vue-aware "Save from Controls" handler
 *
 * Intercepts Storybook's SAVE_STORY_REQUEST for .stories.vue files
 * and handles saving with Vue SFC-aware parsing instead of Babel.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { storyNameToExportName } from '$lib/utils/identifier-utils'
import { parse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { serializeArgs } from './serialize-args'

// Storybook channel event names
const SAVE_STORY_REQUEST = 'saveStoryRequest'
const SAVE_STORY_RESPONSE = 'saveStoryResponse'

// Vue compiler-core node types
const NodeTypes = {
  ELEMENT: 1,
  ATTRIBUTE: 6,
  DIRECTIVE: 7,
} as const

interface TemplateNode {
  type: number
  tag?: string
  loc: {
    start: { offset: number, line: number, column: number }
    end: { offset: number, line: number, column: number }
    source: string
  }
  props?: TemplateProp[]
  children?: TemplateNode[]
}

interface TemplateProp {
  type: number
  name?: string
  rawName?: string
  loc: {
    start: { offset: number, line: number, column: number }
    end: { offset: number, line: number, column: number }
    source: string
  }
  value?: {
    content: string
    loc: {
      start: { offset: number }
      end: { offset: number }
    }
  }
  arg?: {
    content: string
  }
  exp?: {
    content: string
    loc: {
      start: { offset: number }
      end: { offset: number }
    }
  }
}

interface SaveStoryRequest {
  id: string
  payload: {
    csfId: string
    importPath: string
    args: string | undefined
    name?: string
  }
}

interface Channel {
  on: (event: string, handler: (data: any) => void) => void
  emit: (event: string, data: any) => void
}

/**
 * Register the Vue CSF save story handler on the Storybook channel.
 */
export function initializeSaveStory(channel: Channel): void {
  channel.on(SAVE_STORY_REQUEST, async ({ id, payload }: SaveStoryRequest) => {
    const { csfId, importPath, args, name } = payload

    // Only handle .stories.vue files
    if (!importPath.endsWith('.stories.vue')) {
      return
    }

    const sourceFilePath = join(process.cwd(), importPath)
    const sourceFileName = basename(importPath)

    try {
      // Read and parse the Vue SFC
      const code = readFileSync(sourceFilePath, 'utf-8')
      const { descriptor, errors } = parse(code, { filename: sourceFilePath })

      if (errors.length > 0) {
        throw new Error(`Vue SFC parse error: ${errors[0].message}`)
      }

      if (!descriptor.template?.ast) {
        throw new Error(`No <template> found in ${sourceFileName}`)
      }

      // Find the story by csfId
      const storyId = csfId.split('--').pop() || ''
      const templateAst = descriptor.template.ast as unknown as TemplateNode
      const storyNode = findStoryNode(templateAst, storyId)

      if (!storyNode) {
        throw new Error(`Story "${storyId}" not found in ${sourceFileName}`)
      }

      const incomingArgs = args ? JSON.parse(args) : {}
      const ms = new MagicString(code)

      if (name) {
        // CREATE NEW STORY: clone the existing Story tag with new name + args
        const existingArgs = parseExistingArgs(storyNode.node)
        const mergedArgs = { ...existingArgs, ...incomingArgs }
        const newStorySource = createNewStorySource(storyNode, name, mergedArgs)
        // Insert after the current story element
        ms.appendRight(storyNode.loc.end.offset, `\n\n  ${newStorySource}`)
      }
      else {
        // UPDATE EXISTING STORY: merge incoming args with existing args
        const existingArgs = parseExistingArgs(storyNode.node)
        const mergedArgs = { ...existingArgs, ...incomingArgs }
        updateStoryArgs(ms, storyNode, mergedArgs)
      }

      const updatedCode = ms.toString()
      writeFileSync(sourceFilePath, updatedCode)

      // Build response
      const newStoryExportName = name || undefined
      const newStoryName = name ? exportNameToDisplayName(name) : undefined
      const [componentId] = csfId.split('--')
      const newStoryId = name ? `${componentId}--${name.toLowerCase().replace(/\s+/g, '-')}` : undefined

      channel.emit(SAVE_STORY_RESPONSE, {
        id,
        success: true,
        payload: {
          csfId,
          newStoryId,
          newStoryName,
          newStoryExportName,
          sourceFileContent: updatedCode,
          sourceFileName,
          sourceStoryName: storyNode.storyName,
          sourceStoryExportName: storyNode.exportName,
        },
        error: null,
      })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      channel.emit(SAVE_STORY_RESPONSE, {
        id,
        success: false,
        error: `[sb-addon-vue-csf] ${message}`,
      })
    }
  })
}

interface FoundStoryNode {
  node: TemplateNode
  storyName: string
  exportName: string
  loc: TemplateNode['loc']
}

/**
 * Find a <Story> node in the template AST matching a story ID.
 */
function findStoryNode(ast: TemplateNode, storyId: string): FoundStoryNode | null {
  const stories: FoundStoryNode[] = []

  function traverse(node: TemplateNode): void {
    if (node.type === NodeTypes.ELEMENT && node.tag === 'Story') {
      const nameAttr = node.props?.find(
        p => p.type === NodeTypes.ATTRIBUTE && p.name === 'name',
      )
      const exportNameAttr = node.props?.find(
        p => (p.type === NodeTypes.ATTRIBUTE && (p.name === 'exportName' || p.name === 'export-name')),
      )

      const name = nameAttr?.value?.content || ''
      const exportName = exportNameAttr?.value?.content || storyNameToExportName(name)

      stories.push({
        node,
        storyName: name,
        exportName,
        loc: node.loc,
      })
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  traverse(ast)

  // Match by comparing the story export name (lowercased) with the storyId from csfId
  return stories.find(s => s.exportName.toLowerCase().replace(/\s+/g, '-') === storyId)
    || stories.find(s => storyNameToExportName(s.storyName).toLowerCase() === storyId)
    || null
}

/**
 * Update the :args prop on a <Story> node using MagicString.
 */
function updateStoryArgs(ms: MagicString, story: FoundStoryNode, args: Record<string, unknown>): void {
  const { node } = story
  const argsProp = findArgsProp(node)

  const serialized = serializeArgs(args, getIndent(story))

  if (argsProp) {
    if (argsProp.type === NodeTypes.DIRECTIVE && argsProp.exp) {
      // Replace the expression content: :args="{ ... }"
      ms.overwrite(argsProp.exp.loc.start.offset, argsProp.exp.loc.end.offset, serialized)
    }
    else if (argsProp.type === NodeTypes.ATTRIBUTE) {
      // Static args="..." → upgrade to :args="{ ... }"
      ms.overwrite(argsProp.loc.start.offset, argsProp.loc.end.offset, `:args="${serialized}"`)
    }
  }
  else {
    // No args prop — insert one after the tag name or last attribute
    const insertPos = findArgsInsertPosition(node)
    ms.appendRight(insertPos, `\n${' '.repeat(getIndent(story) + 2)}:args="${serialized}"`)
  }
}

/**
 * Parse existing args from a Story node's :args expression.
 * Safely evaluates the JS expression to extract current arg values.
 */
function parseExistingArgs(node: TemplateNode): Record<string, unknown> {
  const argsProp = findArgsProp(node)
  if (!argsProp)
    return {}

  const expression = argsProp.type === NodeTypes.DIRECTIVE
    ? argsProp.exp?.content
    : argsProp.value?.content

  if (!expression)
    return {}

  try {
    // eslint-disable-next-line no-new-func
    return new Function(`return (${expression})`)() as Record<string, unknown>
  }
  catch {
    return {}
  }
}

/**
 * Find the :args or args prop on a Story node.
 */
function findArgsProp(node: TemplateNode): TemplateProp | undefined {
  return node.props?.find((p) => {
    if (p.type === NodeTypes.DIRECTIVE && p.arg?.content === 'args')
      return true
    if (p.type === NodeTypes.ATTRIBUTE && p.name === 'args')
      return true
    return false
  })
}

/**
 * Find a position to insert a new :args attribute (after existing props).
 */
function findArgsInsertPosition(node: TemplateNode): number {
  if (node.props && node.props.length > 0) {
    // Insert after the last prop
    const lastProp = node.props[node.props.length - 1]
    return lastProp.loc.end.offset
  }
  // Insert after the tag name: <Story|
  return node.loc.start.offset + (node.tag?.length || 5) + 1
}

/**
 * Get the base indent level for a story node (number of spaces).
 */
function getIndent(story: FoundStoryNode): number {
  // Column is 0-based, represents the indent of <Story
  return story.loc.start.column - 1
}

/**
 * Create source for a new <Story> tag cloned from an existing one.
 */
function createNewStorySource(
  story: FoundStoryNode,
  newName: string,
  args: Record<string, unknown>,
): string {
  const indent = getIndent(story)
  const pad = ' '.repeat(indent + 2)
  const serialized = serializeArgs(args, indent + 2)

  // Build a clean new Story tag
  return `<Story\n${pad}name="${exportNameToDisplayName(newName)}"\n${pad}:args="${serialized}"\n${' '.repeat(indent)}/>`
}

/**
 * Convert an export name to a display name.
 * e.g., "MyNewStory" → "My New Story"
 */
function exportNameToDisplayName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim()
}
