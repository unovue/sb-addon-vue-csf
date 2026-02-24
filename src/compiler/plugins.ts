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
    name: 'storybook:addon-vue-csf',
    async transform(compiledCode, id) {
      if (!filter(id))
        return undefined

      // Parse the compiled JavaScript
      const compiledAST = this.parse(compiledCode)

      const magicCompiledCode = new MagicString(compiledCode)
      const rawCode = readFileSync(id, 'utf-8')

      const vueAST = getVueSfcAST({ code: rawCode, filename: id })
      const vueNodes = await extractVueASTNodes({
        ast: vueAST,
        filename: id,
      })
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

      console.log(magicCompiledCode.toString())

      return {
        code: magicCompiledCode.toString(),
        map: magicCompiledCode.generateMap({ hires: true, source: id }),
      }
    },
  }
}
