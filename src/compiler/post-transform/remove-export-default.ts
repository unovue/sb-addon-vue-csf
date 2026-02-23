/**
 * Remove the default export from compiled code
 * 
 * In Vue CSF, we don't use default exports. Instead, we generate
 * the CSF exports in the appendix.
 */

import MagicString from 'magic-string';
import type { CompiledNodes } from '$lib/parser/extract/compiled/nodes.js';

export function removeExportDefault(code: MagicString, nodes: CompiledNodes): void {
  if (!nodes.defaultExport) {
    return;
  }

  // Find and remove the default export
  // This is a simplified version - in production, use proper AST manipulation
  const codeStr = code.toString();
  const defaultExportRegex = /export\s+default\s+/;
  
  if (defaultExportRegex.test(codeStr)) {
    // Replace export default with a variable declaration
    code.replace(defaultExportRegex, 'const __vueCsfDefault = ');
  }
}
