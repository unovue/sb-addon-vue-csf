/**
 * Post-transform module for Vue CSF
 * 
 * This transforms the compiled Vue code into valid CSF format.
 * It adds the necessary exports and runtime story creation code.
 */

import MagicString from 'magic-string';
import type { ExtractedSvelteNodes } from '$lib/parser/extract/svelte/nodes.js';
import type { CompiledNodes } from '$lib/parser/extract/compiled/nodes.js';
import { createAppendix } from './create-appendix.js';
import { removeExportDefault } from './remove-export-default.js';

export interface TransformStoriesCodeOptions {
  code: MagicString;
  nodes: {
    svelte: ExtractedSvelteNodes;
    compiled: CompiledNodes;
  };
  filename: string;
  originalCode: string;
}

/**
 * Transform the compiled stories code
 */
export async function transformStoriesCode(options: TransformStoriesCodeOptions): Promise<void> {
  const { code, nodes, filename } = options;

  // Remove default export if it exists
  removeExportDefault(code, nodes.compiled);

  // Create and append the CSF exports
  const appendix = createAppendix(nodes.svelte, filename);
  code.append('\n' + appendix);
}
