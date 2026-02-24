/**
 * Create the appendix code for CSF exports
 *
 * This generates the code that exports stories in CSF format
 * and wires them up with the runtime story creator.
 */

import type { ExtractedVueNodes, StoryNode } from '$lib/parser/extract/vue/nodes'
import { storyNameToExportName } from '$lib/utils/identifier-utils'

export function createAppendix(
  nodes: ExtractedVueNodes,
  // eslint-disable-next-line unused-imports/no-unused-vars
  filename: string,
): string {
  // Use raw source if available, otherwise serialize the properties
  const metaCode = nodes.defineMeta?.rawSource || JSON.stringify(nodes.defineMeta?.properties || {})

  // Generate story exports with inline render functions
  const storyExports = nodes.stories.map((story) => {
    const exportName = story.exportName || storyNameToExportName(story.name)
    return createStoryExport(story, exportName, metaCode)
  })

  // Generate the runtime stories creation
  const runtimeCode = `
import { h } from 'vue';
// import { StoryRenderer } from 'addon-vue-csf';
import { StoryRenderer } from '../dist/index.js';

const meta = ${metaCode};

export default {
  ...meta,
  // Include component reference for Storybook to extract argTypes
  component: meta.component,
};

${storyExports.join('\n')}

// Create stories object for runtime access
const stories = {
${nodes.stories.map((story) => {
  const exportName = story.exportName || storyNameToExportName(story.name)
  return `  ${exportName},`
}).join('\n')}
};

export { stories };
`

  return runtimeCode
}

function createStoryExport(story: StoryNode, exportName: string, metaCode: string): string {
  const args = story.props.args || story.props || {}

  return `
export const ${exportName} = {
  name: ${JSON.stringify(story.name)},
  args: ${JSON.stringify(args)},
  parameters: ${JSON.stringify(story.props.parameters || {})},
  tags: ${JSON.stringify(story.props.tags || [])},
  render: (args, storyContext) => {
    return h(StoryRenderer, {
      exportName: ${JSON.stringify(exportName)},
      storiesComponent: __vueCsfComponent,
      storyContext,
      args,
      metaRenderTemplate: ${metaCode}.render,
    });
  },
};
`
}
