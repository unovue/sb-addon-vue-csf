/**
 * Vite plugins for Vue CSF
 * 
 * These plugins transform .stories.vue files into valid CSF format
 * that Storybook can understand.
 */

import fs from 'node:fs';
import type { Plugin } from 'vite';
import MagicString from 'magic-string';
import { getVueSfcAST, isVueStoriesFile } from '$lib/parser/ast.js';
import { extractSvelteASTNodes } from '$lib/parser/extract/svelte/nodes.js';
import { extractCompiledASTNodes } from '$lib/parser/extract/compiled/nodes.js';
import { transformStoriesCode } from './post-transform/index.js';

/**
 * Main transform plugin that runs after Vue compiles the SFC
 */
export async function transformPlugin(): Promise<Plugin> {
  const [{ createFilter }] = await Promise.all([import('vite')]);

  const include = /\.stories\.vue$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-vue-csf',
    config() {
      return {
        optimizeDeps: {
          include: ['@storybook/addon-vue-csf/internal/create-runtime-stories'],
        },
      };
    },
    async transform(compiledCode, id) {
      if (!filter(id)) return undefined;

      // Parse the compiled JavaScript
      const compiledAST = this.parse(compiledCode);
      
      let magicCompiledCode = new MagicString(compiledCode);
      let rawCode = fs.readFileSync(id).toString();

      const svelteAST = getVueSfcAST({ code: rawCode, filename: id });
      const svelteASTNodes = await extractSvelteASTNodes({
        ast: svelteAST,
        filename: id,
      });
      const compiledASTNodes = await extractCompiledASTNodes({
        ast: compiledAST,
        filename: id,
      });

      await transformStoriesCode({
        code: magicCompiledCode,
        nodes: {
          svelte: svelteASTNodes,
          compiled: compiledASTNodes,
        },
        filename: id,
        originalCode: rawCode,
      });

      return {
        code: magicCompiledCode.toString(),
        map: magicCompiledCode.generateMap({ hires: true, source: id }),
      };
    },
  };
}

/**
 * Pre-transform plugin for legacy template support (optional)
 */
export async function preTransformPlugin(): Promise<Plugin> {
  const [{ createFilter }] = await Promise.all([import('vite')]);
  const include = /\.stories\.vue$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-vue-csf-legacy-support',
    enforce: 'pre',
    transform: {
      order: 'pre',
      async handler(code, id) {
        if (!filter(id)) return undefined;

        // For now, return code as-is
        // Legacy template support can be added here if needed

        return {
          code,
          map: null,
        };
      },
    },
  };
}
