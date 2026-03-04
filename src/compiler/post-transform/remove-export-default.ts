/**
 * Remove the default export from compiled code
 *
 * In Vue CSF, we don't use default exports. Instead, we generate
 * the CSF exports in the appendix.
 */

import type { CompiledNodes } from '$lib/parser/extract/compiled/nodes'
import type MagicString from 'magic-string'

export function removeExportDefault(code: MagicString, nodes: CompiledNodes): void {
  if (!nodes.defaultExport) {
    return
  }

  // Use the AST node position for precise replacement
  // The defaultExport node is the ExportDefaultDeclaration's declaration
  const node = nodes.defaultExport as { start?: number, end?: number }
  if (node.start != null) {
    // Find 'export default' before the declaration start and replace with variable declaration
    const codeStr = code.toString()
    const prefix = codeStr.slice(0, node.start)
    const exportDefaultMatch = prefix.match(/export\s+default\s+$/)
    if (exportDefaultMatch) {
      const exportStart = node.start - exportDefaultMatch[0].length
      code.overwrite(exportStart, node.start, 'const __vueCsfComponent = ')
      return
    }
  }

  // Fallback: regex-based replacement (for cases where AST positions aren't available)
  const defaultExportRegex = /export\s+default\s+/
  const codeStr = code.toString()
  if (defaultExportRegex.test(codeStr)) {
    code.replace(defaultExportRegex, 'const __vueCsfComponent = ')
  }
}
