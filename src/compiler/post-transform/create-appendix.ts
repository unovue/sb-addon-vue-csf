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
  filename: string,
): string {
  // Use raw source if available, otherwise serialize the properties
  const metaCode = nodes.defineMeta?.rawSource || JSON.stringify(nodes.defineMeta?.properties || {})

  if (nodes.stories.length === 0) {
    console.warn(`[sb-addon-vue-csf] No <Story> components found in ${filename}. The file will produce no story exports.`)
  }

  // Check if meta has a render function (by checking if we extracted a render function name)
  const renderFunctionName = nodes.defineMeta?.renderFunctionName
  const hasMetaRender = !!renderFunctionName

  // Detect duplicate story export names
  const seenExportNames = new Set<string>()
  // Generate story exports with inline render functions
  const storyExports = nodes.stories.map((story) => {
    // Always sanitize export name — raw story names like "New Story" are
    // not valid JS identifiers and must be converted to PascalCase
    const exportName = storyNameToExportName(story.exportName || story.name)
    if (seenExportNames.has(exportName)) {
      throw new Error(`[sb-addon-vue-csf] Duplicate story export name "${exportName}" in ${filename}. Each <Story> must have a unique name.`)
    }
    seenExportNames.add(exportName)
    return createStoryExport(story, exportName, metaCode, hasMetaRender, renderFunctionName)
  })

  // Build excludeStories array for helper exports (render functions, reusable templates)
  const excludeStories: string[] = []
  if (renderFunctionName) {
    excludeStories.push(renderFunctionName)
  }

  const excludeStoriesCode = excludeStories.length > 0
    ? `\n  excludeStories: ${JSON.stringify(excludeStories)},`
    : ''

  // Generate the runtime stories creation
  // Use a unique alias for h to avoid conflicts with user imports
  const runtimeCode = `
import { h as __vueCsfH } from 'vue';
import { StoryRenderer } from 'sb-addon-vue-csf';

const meta = ${metaCode};

export default {
  ...meta,
  // Include component reference for Storybook to extract argTypes
  component: meta.component,${excludeStoriesCode}
};

${storyExports.join('\n')}

// Create stories object for runtime access
const stories = {
${nodes.stories.map((story) => {
  const exportName = storyNameToExportName(story.exportName || story.name)
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
