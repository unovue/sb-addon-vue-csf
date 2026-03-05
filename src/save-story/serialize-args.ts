/**
 * Serialize a JavaScript value to a Vue template-friendly expression string.
 *
 * Converts JSON-style objects to readable JS object literals:
 *   { primary: true, label: 'Button' }
 *
 * Used when writing args back to .stories.vue files.
 */

import { isValidIdentifier } from '$lib/utils/identifier-utils'

/**
 * Serialize args to a Vue template expression string.
 * Handles multiline formatting for objects with multiple keys.
 */
export function serializeArgs(value: unknown, indent: number = 0): string {
  if (value === null)
    return 'null'
  if (value === undefined)
    return 'undefined'

  if (typeof value === 'boolean')
    return String(value)
  if (typeof value === 'number')
    return String(value)

  if (typeof value === 'string') {
    // Escape single quotes and use single-quote style
    const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
    return `'${escaped}'`
  }

  if (Array.isArray(value)) {
    if (value.length === 0)
      return '[]'
    const items = value.map(item => serializeArgs(item, indent + 2))
    // Inline short arrays
    const inline = `[${items.join(', ')}]`
    if (inline.length <= 60)
      return inline
    // Multiline for long arrays
    const pad = ' '.repeat(indent + 2)
    return `[\n${items.map(item => `${pad}${item}`).join(',\n')},\n${' '.repeat(indent)}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0)
      return '{}'

    const pairs = entries.map(([key, val]) => {
      const keyStr = isValidIdentifier(key) ? key : `'${key}'`
      return `${keyStr}: ${serializeArgs(val, indent + 2)}`
    })

    // Inline short objects
    const inline = `{ ${pairs.join(', ')} }`
    if (inline.length <= 60)
      return inline

    // Multiline for larger objects
    const pad = ' '.repeat(indent + 2)
    return `{\n${pairs.map(p => `${pad}${p}`).join(',\n')},\n${' '.repeat(indent)}}`
  }

  return String(value)
}
