/**
 * Storybook indexer for Vue CSF stories
 *
 * Indexers are responsible for:
 * 1. Discovering stories in .stories.vue files
 * 2. Providing metadata about the stories (title, name, etc.)
 * 3. Generating the story source for Storybook to use
 */

import type { Indexer, IndexInput } from 'storybook/internal/types'
import { readFileSync } from 'node:fs'
import { getVueSfcAST } from '../parser/ast'
import { extractVueASTNodes } from '../parser/extract/vue/nodes'
import { storyNameToExportName } from '../utils/identifier-utils'

export function createIndexer(_legacyTemplate: boolean = false): Indexer {
  return {
    test: /\.stories\.vue$/,
    createIndex: async (fileName: string, { makeTitle }: { makeTitle: (userTitle: string) => string }): Promise<IndexInput[]> => {
      const code = readFileSync(fileName, 'utf-8')
      const ast = getVueSfcAST({ code, filename: fileName })
      const nodes = await extractVueASTNodes({ ast, filename: fileName })

      const meta = nodes.defineMeta?.properties || {}
      const title = (meta.title as string) || makeTitle(fileName)

      const stories: IndexInput[] = []

      for (const story of nodes.stories) {
        const exportName = storyNameToExportName(story.exportName || story.name)
        stories.push({
          type: 'story',
          importPath: fileName,
          exportName,
          name: story.name || undefined,
          title,
          tags: (story.props.tags as string[]) || [],
        })
      }

      // Add default story if none defined
      if (stories.length === 0) {
        stories.push({
          type: 'story',
          importPath: fileName,
          exportName: 'Default',
          name: 'Default',
          title,
        })
      }

      return stories
    },
  }
}
