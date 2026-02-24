/**
 * This file contains functions to extract nodes from Vue SFC AST
 *
 * For Vue, we need to extract:
 * 1. The defineMeta function call from <script setup>
 * 2. Story component usages from <template>
 */

import type { VueSfcAst } from '../../ast.js'

// Vue AST node types (from @vue/compiler-core)
const NodeTypes = {
  ROOT: 0,
  ELEMENT: 1,
  TEXT: 2,
  ATTRIBUTE: 6,
  DIRECTIVE: 7,
} as const

// Babel AST types for expression parsing
interface ASTNode {
  type: string
  value?: unknown
  name?: string
  raw?: string
  operator?: string
  argument?: ASTNode
  extra?: {
    rawValue?: unknown
    raw?: string
  }
  properties?: Array<{
    type: string
    key: ASTNode
    value: ASTNode
  }>
  elements?: ASTNode[]
}

// Vue template AST node interfaces - loosely typed to avoid conflicts
// with @vue/compiler-core's internal types
interface TemplateNode {
  type: number
  loc?: {
    source: string
  }
  tag?: string
  props?: Array<{
    type: number
    name?: string
    rawName?: string
    value?: {
      content: string
    }
    arg?: {
      type: number
      content: string
    }
    exp?: {
      type: number
      content: string
      ast?: ASTNode
    }
  }>
  children?: TemplateNode[]
}

export interface StoryNode {
  name: string
  exportName?: string
  props: Record<string, unknown>
  template?: string
}

export interface DefineMetaNode {
  properties: Record<string, unknown>
  renderTemplate?: string
  /**
   * The raw source code of the meta object (for code generation)
   * This is the object literal string that can be used in generated code
   */
  rawSource?: string
  /**
   * The name of the render function if render is a function reference
   */
  renderFunctionName?: string
}

export interface ExtractedVueNodes {
  defineMeta: DefineMetaNode | null
  stories: StoryNode[]
}

/**
 * Extract nodes from Vue SFC AST
 *
 * Uses the template AST from @vue/compiler-sfc for reliable extraction
 */
export async function extractVueASTNodes({
  ast,
  // eslint-disable-next-line unused-imports/no-unused-vars
  filename,
}: {
  ast: VueSfcAst
  filename: string
}): Promise<ExtractedVueNodes> {
  const { descriptor } = ast

  // Extract from script setup (preferred) or regular script
  // Note: script setup is where defineMeta is typically defined
  const scriptContent = descriptor.scriptSetup?.content || descriptor.script?.content || ''

  // Use AST-based extraction for defineMeta
  const defineMeta = extractDefineMeta(scriptContent)

  // Use AST-based extraction for stories from template
  const stories = descriptor.template?.ast
    ? extractStoriesFromAST(descriptor.template.ast as unknown as TemplateNode)
    : extractStoriesFromTemplate(descriptor.template?.content || '')

  return {
    defineMeta,
    stories,
  }
}

/**
 * Extract defineMeta call from script content
 */
function extractDefineMeta(scriptContent: string): DefineMetaNode | null {
  // Match defineMeta call with balanced braces
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const defineMetaRegex = /const\s*\{\s*Story\s*\}\s*=\s*defineMeta\s*\(\s*(\{[\s\S]*?)\s*\)\s*(?:;\s*)?$/m
  const match = defineMetaRegex.exec(scriptContent)

  if (!match) {
    return null
  }

  // Parse the object literal
  try {
    const objStr = match[1]
    // Find balanced closing brace
    let braceDepth = 0
    let endIndex = 0
    for (let i = 0; i < objStr.length; i++) {
      if (objStr[i] === '{') {
        braceDepth++
      }
      else if (objStr[i] === '}') {
        braceDepth--
        if (braceDepth === 0) {
          endIndex = i + 1
          break
        }
      }
    }
    const balancedObjStr = objStr.substring(0, endIndex)

    // Extract render function name if render is a function reference
    // Matches patterns like: render: defaultTemplate, or render: myRender,
    const renderFunctionMatch = /render\s*:\s*(\w+)/.exec(balancedObjStr)
    const renderFunctionName = renderFunctionMatch ? renderFunctionMatch[1] : undefined

    return {
      properties: parseObjectLiteral(balancedObjStr),
      rawSource: balancedObjStr.trim(),
      renderFunctionName,
    }
  }
  catch {
    return { properties: {} }
  }
}

/**
 * Extract Story components from template AST
 * This is the preferred method as it's more reliable than regex parsing
 */
function extractStoriesFromAST(ast: TemplateNode): StoryNode[] {
  const stories: StoryNode[] = []

  function traverse(node: TemplateNode): void {
    if (node.type === NodeTypes.ELEMENT) {
      const element = node

      if (element.tag === 'Story') {
        const story = extractStoryFromElement(element)
        if (story) {
          stories.push(story)
        }
      }

      // Recurse into children
      if (element.children) {
        for (const child of element.children) {
          traverse(child)
        }
      }
    }
  }

  // Start traversing from root children
  if (ast.children) {
    for (const child of ast.children) {
      traverse(child)
    }
  }

  return stories
}

/**
 * Extract a StoryNode from an ElementNode
 */
function extractStoryFromElement(element: TemplateNode): StoryNode | null {
  const props: Record<string, unknown> = {}
  let name = ''
  let exportName = ''

  // Extract props from the element
  for (const prop of element.props || []) {
    if (prop.type === NodeTypes.ATTRIBUTE) {
      // Static attribute: name="value"
      const value = prop.value?.content ?? true

      if (prop.name === 'name') {
        name = String(value)
        props.name = name
        // Only set exportName from name if exportName wasn't explicitly provided
        if (!exportName) {
          exportName = name
        }
      }
      else if (prop.name === 'exportName' || prop.name === 'export-name') {
        exportName = String(value)
        props.exportName = exportName
      }
      else if (prop.name === 'asChild') {
        props.asChild = true
      }
      else if (prop.name) {
        props[prop.name] = value
      }
    }
    else if (prop.type === NodeTypes.DIRECTIVE) {
      // Directive: v-bind, v-on, etc.
      if (prop.name === 'bind' && prop.arg) {
        // v-bind directive: :args="expression"
        const argName = prop.arg.content
        const expContent = prop.exp?.content
        const expAst = prop.exp?.ast

        if (argName === 'args' && expContent) {
          // Use AST if available for proper parsing, fallback to string parsing
          props.args = expAst
            ? parseExpressionFromAST(expAst)
            : parseExpression(expContent)
        }
        else if (argName === 'name' && expContent) {
          // Handle :name="expression"
          name = expContent
          props.name = expContent
          // Only set exportName from name if exportName wasn't explicitly provided
          if (!exportName) {
            exportName = expContent
          }
        }
        else if ((argName === 'exportName' || argName === 'export-name') && expContent) {
          exportName = expContent
          props.exportName = expContent
        }
        else if (argName === 'asChild') {
          props.asChild = true
        }
        else if (expContent) {
          // Store other dynamic props
          props[argName] = expContent
        }
      }
    }
  }

  // Use loc.source to get the original template if needed
  const template = element.loc?.source

  return {
    name: name || '',
    exportName,
    props,
    template,
  }
}

/**
 * Parse a JavaScript expression from Babel AST
 * This is more reliable than string parsing for complex expressions
 */
function parseExpressionFromAST(ast: ASTNode): unknown {
  switch (ast.type) {
    case 'ObjectExpression': {
      const obj: Record<string, unknown> = {}
      for (const prop of ast.properties || []) {
        const key = prop.key.type === 'Identifier'
          ? prop.key.name
          : String(parseExpressionFromAST(prop.key))
        obj[key!] = parseExpressionFromAST(prop.value)
      }
      return obj
    }
    case 'ArrayExpression': {
      return (ast.elements || []).map(el => parseExpressionFromAST(el!))
    }
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral': {
      return ast.value
    }
    case 'NullLiteral': {
      return null
    }
    case 'Identifier': {
      // For identifiers, return the name (for undefined, etc.)
      if (ast.name === 'undefined')
        return undefined
      return ast.name
    }
    case 'UnaryExpression': {
      // Handle -1, !true, etc.
      if (ast.operator === '-' && ast.argument?.type === 'NumericLiteral') {
        return -(ast.argument.value as number)
      }
      return ast
    }
    default: {
      // For complex expressions, return the raw representation
      return ast.extra?.raw || ast.raw
    }
  }
}

/**
 * Parse a JavaScript expression string into a value
 * Handles simple object literals and falls back to string representation
 * Note: This is a fallback when AST is not available
 */
function parseExpression(expression: string): unknown {
  const trimmed = expression.trim()

  // Try to parse as JSON (for simple objects/arrays)
  // First, we need to convert the JS object literal to valid JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}'))
    || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      // Convert JS object literal to JSON by:
      // 1. Wrapping keys in quotes (if not already)
      // 2. Converting single quotes to double quotes for strings
      // 3. Handling trailing commas
      const jsonLike = trimmed
        // eslint-disable-next-line regexp/no-potentially-useless-backreference
        .replace(/(['"])?([a-z_$][\w$]*)\1?\s*:/gi, '"$2":') // Unquoted keys
        .replace(/'/g, '"') // Single quotes to double quotes
        .replace(/,\s*([}\]])/g, '$1') // Trailing commas
      return JSON.parse(jsonLike)
    }
    catch {
      // JSON parsing failed, return as string
      return trimmed
    }
  }

  // Try to parse as a primitive value
  if (trimmed === 'true')
    return true
  if (trimmed === 'false')
    return false
  if (trimmed === 'null')
    return null
  if (trimmed === 'undefined')
    return undefined

  // Try to parse as a number
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed)
  }

  // Return as string for other expressions
  return trimmed
}

/**
 * Fallback: Extract Story components from template content using regex
 * This is used when the AST is not available
 */
function extractStoriesFromTemplate(template: string): StoryNode[] {
  const stories: StoryNode[] = []

  // Match Story component tags - using safer regex pattern

  const storyRegex = /<Story\s([^>]*)>/g
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = storyRegex.exec(template)) !== null) {
    let exportName = ''
    const attrs = match[1] || ''
    const props: Record<string, unknown> = {}

    // Extract name attribute
    const nameMatch = /name\s*=\s*["']([^"']+)["']/.exec(attrs)
    if (nameMatch) {
      exportName = nameMatch[1]
      props.name = exportName
      props.exportName = exportName
    }

    // Extract args attribute
    const argsMatch = /:args="(\{[\s\S]*?\})"/.exec(attrs)
    if (argsMatch) {
      try {
        props.args = JSON.parse(argsMatch[1].replace(/'/g, '"'))
      }
      catch {
        props.args = {}
      }
    }

    // Check for asChild prop
    if (attrs.includes('asChild')) {
      props.asChild = true
    }

    stories.push({
      name: (props.name as string) || 'Unnamed',
      exportName,
      props,
    })
  }

  return stories
}

/**
 * Parse a key-value pair from object literal string
 * Handles nested objects by tracking brace depth
 */
function parseKeyValue(str: string, startIndex: number): { key: string, value: string, endIndex: number } | null {
  // Find the colon separator
  let colonIndex = -1
  let braceDepth = 0
  let bracketDepth = 0
  let inString: string | null = null

  for (let i = startIndex; i < str.length; i++) {
    const char = str[i]
    const prevChar = i > 0 ? str[i - 1] : null

    // Handle string boundaries
    if ((char === '"' || char === '\'') && prevChar !== '\\') {
      if (inString === null) {
        inString = char
      }
      else if (inString === char) {
        inString = null
      }
      continue
    }

    // Skip processing inside strings
    if (inString !== null)
      continue

    // Track depth
    if (char === '{') {
      braceDepth++
    }
    else if (char === '}') {
      braceDepth--
    }
    else if (char === '[') {
      bracketDepth++
    }
    else if (char === ']') {
      bracketDepth--
    }
    else if (char === ':' && braceDepth === 0 && bracketDepth === 0) {
      colonIndex = i
      break
    }
  }

  if (colonIndex === -1)
    return null

  const key = str.substring(startIndex, colonIndex).trim()

  // Find the value end (comma at depth 0 or end of string)
  let valueEnd = str.length
  braceDepth = 0
  bracketDepth = 0
  inString = null

  for (let i = colonIndex + 1; i < str.length; i++) {
    const char = str[i]
    const prevChar = i > 0 ? str[i - 1] : null

    // Handle string boundaries
    if ((char === '"' || char === '\'') && prevChar !== '\\') {
      if (inString === null) {
        inString = char
      }
      else if (inString === char) {
        inString = null
      }
      continue
    }

    if (inString !== null)
      continue

    if (char === '{') {
      braceDepth++
    }
    else if (char === '}') {
      braceDepth--
    }
    else if (char === '[') {
      bracketDepth++
    }
    else if (char === ']') {
      bracketDepth--
    }
    else if (char === ',' && braceDepth === 0 && bracketDepth === 0) {
      valueEnd = i
      break
    }
    else if (braceDepth < 0 || (braceDepth === 0 && char === '}')) {
      // End of object
      valueEnd = i
      break
    }
  }

  const value = str.substring(colonIndex + 1, valueEnd).trim()

  return {
    key,
    value,
    endIndex: valueEnd,
  }
}

/**
 * Parse object literal with support for nested objects
 */
function parseObjectLiteral(str: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  let index = 0
  // Skip opening brace
  if (str[index] === '{')
    index++

  while (index < str.length) {
    // Skip whitespace and commas
    while (index < str.length && /[\s,]/.test(str[index])) index++

    // Check for end of object
    if (index >= str.length || str[index] === '}')
      break

    const parsed = parseKeyValue(str, index)
    if (!parsed)
      break

    const { key, value } = parsed
    index = parsed.endIndex

    // Try to parse the value
    try {
      // Check if it's a nested object
      if (value.startsWith('{')) {
        result[key] = parseObjectLiteral(value)
      }
      // Check if it's an array
      else if (value.startsWith('[')) {
        result[key] = JSON.parse(value.replace(/'/g, '"'))
      }
      // Try JSON parsing for primitives
      else {
        result[key] = JSON.parse(value.replace(/'/g, '"'))
      }
    }
    catch {
      // If parsing fails, store as string (for component references, etc.)
      result[key] = value
    }
  }

  return result
}
