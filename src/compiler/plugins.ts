/**
 * Vite plugins for Vue CSF
 *
 * These plugins transform .stories.vue files into valid CSF format
 * that Storybook can understand.
 */

import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { getVueSfcAST } from '$lib/parser/ast'
import { extractCompiledASTNodes } from '$lib/parser/extract/compiled/nodes'
import { extractVueASTNodes } from '$lib/parser/extract/vue/nodes'
import MagicString from 'magic-string'
import { transformStoriesCode } from './post-transform/index'

/**
 * Main transform plugin that runs after Vue compiles the SFC
 */
export async function transformPlugin(): Promise<Plugin> {
  const [{ createFilter }] = await Promise.all([import('vite')])

  const include = /\.stories\.vue$/
  const filter = createFilter(include)

  return {
    name: 'storybook:sb-addon-vue-csf',
    async transform(compiledCode, id) {
      if (!filter(id))
        return undefined

      // Parse the compiled JavaScript
      let compiledAST: ReturnType<typeof this.parse>
      try {
        compiledAST = this.parse(compiledCode)
      }
      catch (error) {
        this.error(`[sb-addon-vue-csf] Failed to parse compiled code for ${id}: ${error instanceof Error ? error.message : error}`)
      }

      const magicCompiledCode = new MagicString(compiledCode)

      let rawCode: string
      try {
        rawCode = readFileSync(id, 'utf-8')
      }
      catch (error) {
        this.error(`[sb-addon-vue-csf] Failed to read file ${id}: ${error instanceof Error ? error.message : error}`)
      }

      const vueAST = getVueSfcAST({ code: rawCode, filename: id })
      if (vueAST.errors.length > 0) {
        this.warn(`[sb-addon-vue-csf] Vue SFC parse errors in ${id}: ${vueAST.errors.map(e => e.message).join(', ')}`)
      }

      const vueNodes = await extractVueASTNodes({
        ast: vueAST,
        filename: id,
      })

      if (!vueNodes.defineMeta) {
        this.warn(`[sb-addon-vue-csf] No defineMeta() found in ${id}. Ensure your story file calls defineMeta().`)
      }

      const compiledASTNodes = await extractCompiledASTNodes({
        ast: compiledAST,
        filename: id,
      })

      await transformStoriesCode({
        code: magicCompiledCode,
        nodes: {
          vue: vueNodes,
          compiled: compiledASTNodes,
        },
        filename: id,
        originalCode: rawCode,
      })

      return {
        code: magicCompiledCode.toString(),
        map: magicCompiledCode.generateMap({ hires: true, source: id }),
      }
    },
  }
}
