/**
 * Post-transform module for Vue CSF
 *
 * This transforms the compiled Vue code into valid CSF format.
 * It adds the necessary exports and runtime story creation code.
 */

import type { CompiledNodes } from '$lib/parser/extract/compiled/nodes.js'
import type { ExtractedVueNodes } from '$lib/parser/extract/vue/nodes.js'
import type MagicString from 'magic-string'
import { createAppendix } from './create-appendix.js'
import { removeExportDefault } from './remove-export-default.js'

export interface TransformStoriesCodeOptions {
  code: MagicString
  nodes: {
    vue: ExtractedVueNodes
    compiled: CompiledNodes
  }
  filename: string
  originalCode: string
}

/**
 * Transform the compiled stories code
 */
export async function transformStoriesCode(options: TransformStoriesCodeOptions): Promise<void> {
  const { code, nodes, filename } = options

  // Remove default export if it exists
  removeExportDefault(code, nodes.compiled)

  // Create and append the CSF exports
  const appendix = createAppendix(nodes.vue, filename)
  code.append(`
${appendix}`)
}
