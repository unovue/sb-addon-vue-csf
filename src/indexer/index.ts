/**
 * Storybook indexer for Vue CSF stories
 * 
 * Indexers are responsible for:
 * 1. Discovering stories in .stories.vue files
 * 2. Providing metadata about the stories (title, name, etc.)
 * 3. Generating the story source for Storybook to use
 */

import type { Indexer, IndexedCSFFile, StoryId } from 'storybook/internal/types';
import { readFileSync } from 'fs';
import { getVueSfcAST, isVueStoriesFile } from '../parser/ast.js';
import { extractSvelteASTNodes } from '../parser/extract/svelte/nodes.js';
import { storyNameToExportName } from '../utils/identifier-utils.js';
import type { StoryAnnotations } from '../types.js';

export function createIndexer(_legacyTemplate: boolean = false): Indexer {
  return {
    test: isVueStoriesFile,
    createIndex: async (fileName: string, { makeTitle }: { makeTitle: (userTitle: string) => string }): Promise<IndexedCSFFile> => {
      const code = readFileSync(fileName, 'utf-8');
      const ast = getVueSfcAST({ code, filename: fileName });
      const nodes = await extractSvelteASTNodes({ ast, filename: fileName });

      const meta = nodes.defineMeta?.properties || {};
      const title = meta.title || makeTitle(fileName);
      
      const stories: Array<{ id: StoryId; name: string; tags?: string[] }> = [];

      for (const story of nodes.stories) {
        const exportName = story.exportName || storyNameToExportName(story.name);
        stories.push({
          id: `${title}--${exportName.toLowerCase()}` as StoryId,
          name: story.name,
          tags: story.props.tags || [],
        });
      }

      // Add default story if none defined
      if (stories.length === 0) {
        stories.push({
          id: `${title}--default` as StoryId,
          name: 'Default',
        });
      }

      return {
        meta: {
          title,
          ...meta,
        },
        stories,
      };
    },
  };
}
