/**
 * Create the appendix code for CSF exports
 * 
 * This generates the code that exports stories in CSF format
 * and wires them up with the runtime story creator.
 */

import type { ExtractedSvelteNodes, StoryNode } from '$lib/parser/extract/svelte/nodes.js';
import { storyNameToExportName } from '$lib/utils/identifier-utils.js';

export function createAppendix(nodes: ExtractedSvelteNodes, filename: string): string {
  const metaProperties = nodes.defineMeta?.properties || {};
  
  // Generate story exports
  const storyExports = nodes.stories.map((story) => {
    const exportName = story.exportName || storyNameToExportName(story.name);
    return createStoryExport(story, exportName);
  });

  // Generate the runtime stories creation
  const runtimeCode = `
import { createRuntimeStories } from '@storybook/addon-vue-csf/internal/create-runtime-stories';

const meta = ${JSON.stringify(metaProperties)};

const stories = createRuntimeStories(__vueCsfComponent, meta);

export default {
  ...meta,
  component: __vueCsfComponent,
};

${storyExports.join('\n')}

// Re-export stories from runtime
export { stories };
`;

  return runtimeCode;
}

function createStoryExport(story: StoryNode, exportName: string): string {
  const args = story.props.args || {};
  
  return `
export const ${exportName} = {
  name: ${JSON.stringify(story.name)},
  args: ${JSON.stringify(args)},
  parameters: ${JSON.stringify(story.props.parameters || {})},
  tags: ${JSON.stringify(story.props.tags || [])},
};
`;
}
