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

  // Check if meta has a render function (by checking if we extracted a render function name)
  const renderFunctionName = nodes.defineMeta?.renderFunctionName
  const hasMetaRender = !!renderFunctionName

  // Generate story exports with inline render functions
  const storyExports = nodes.stories.map((story) => {
    const exportName = story.exportName || storyNameToExportName(story.name)
    return createStoryExport(story, exportName, metaCode, hasMetaRender, renderFunctionName)
  })

  // Generate the runtime stories creation
  // Use a unique alias for h to avoid conflicts with user imports
  const runtimeCode = `
import { h as __vueCsfH } from 'vue';
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

function createStoryExport(
  story: StoryNode,
  exportName: string,
  metaCode: string,
  hasMetaRender: boolean,
  renderFunctionName?: string,
): string {
  const args = story.props.args || story.props || {}

  // Build metaRenderTemplate property
  let metaRenderTemplateProp = ''
  if (hasMetaRender && renderFunctionName) {
    // Reference the render function from module scope
    metaRenderTemplateProp = `\n      metaRenderTemplate: ${renderFunctionName},`
  }

  // Use exportName as display name if no explicit name was provided
  const displayName = story.name || exportName

  return `
export const ${exportName} = {
  name: ${JSON.stringify(displayName)},
  args: ${JSON.stringify(args)},
  parameters: ${JSON.stringify(story.props.parameters || {})},
  tags: ${JSON.stringify(story.props.tags || [])},
  render: (args, storyContext) => {
    return __vueCsfH(StoryRenderer, {
      exportName: ${JSON.stringify(exportName)},
      storiesComponent: __vueCsfComponent,
      storyContext,
      args,${metaRenderTemplateProp}
    });
  },
};
`
}
