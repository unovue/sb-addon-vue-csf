import type { ExtractedVueNodes } from '$lib/parser/extract/vue/nodes'
import { describe, expect, it } from 'vitest'
import { createAppendix } from './create-appendix'

function createNodes(overrides: Partial<ExtractedVueNodes> = {}): ExtractedVueNodes {
  return {
    defineMeta: {
      properties: { title: 'Example/Button' },
      rawSource: `{ title: 'Example/Button', component: Button }`,
    },
    stories: [
      {
        name: 'Primary',
        exportName: 'Primary',
        props: { args: { primary: true, label: 'Button' } },
      },
    ],
    ...overrides,
  }
}

describe('createAppendix', () => {
  it('should generate meta export with rawSource when available', () => {
    const nodes = createNodes()
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain(`const meta = { title: 'Example/Button', component: Button }`)
    expect(result).toContain('export default')
    expect(result).toContain('...meta')
  })

  it('should fallback to JSON.stringify when rawSource is not available', () => {
    const nodes = createNodes({
      defineMeta: {
        properties: { title: 'Test' },
      },
    })
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain(`const meta = {"title":"Test"}`)
  })

  it('should generate story exports with correct structure', () => {
    const nodes = createNodes()
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain('export const Primary = {')
    expect(result).toContain('name: "Primary"')
    expect(result).toContain('args: {"primary":true,"label":"Button"}')
    expect(result).toContain('render: (args, storyContext) =>')
    expect(result).toContain('__vueCsfH(StoryRenderer')
  })

  it('should generate multiple story exports', () => {
    const nodes = createNodes({
      stories: [
        { name: 'Primary', exportName: 'Primary', props: { args: { primary: true } } },
        { name: 'Secondary', exportName: 'Secondary', props: { args: { secondary: true } } },
      ],
    })
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain('export const Primary = {')
    expect(result).toContain('export const Secondary = {')
    expect(result).toContain('Primary,')
    expect(result).toContain('Secondary,')
  })

  it('should include excludeStories when render function exists', () => {
    const nodes = createNodes({
      defineMeta: {
        properties: { title: 'Test' },
        rawSource: `{ title: 'Test', render: defaultTemplate }`,
        renderFunctionName: 'defaultTemplate',
      },
    })
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain('excludeStories: ["defaultTemplate"]')
  })

  it('should not include excludeStories when no render function', () => {
    const nodes = createNodes()
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).not.toContain('excludeStories')
  })

  it('should include metaRenderTemplate prop when render function exists', () => {
    const nodes = createNodes({
      defineMeta: {
        properties: { title: 'Test' },
        rawSource: `{ title: 'Test', render: myTemplate }`,
        renderFunctionName: 'myTemplate',
      },
    })
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain('metaRenderTemplate: myTemplate')
  })

  it('should handle empty stories array', () => {
    const nodes = createNodes({ stories: [] })
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain('const meta =')
    expect(result).toContain('export default')
    expect(result).toContain('const stories = {')
  })

  it('should throw on duplicate story export names', () => {
    const nodes = createNodes({
      stories: [
        { name: 'Primary', exportName: 'Primary', props: {} },
        { name: 'Primary', exportName: 'Primary', props: {} },
      ],
    })

    expect(() => createAppendix(nodes, 'test.stories.vue')).toThrow(
      'Duplicate story export name "Primary"',
    )
  })

  it('should handle null defineMeta', () => {
    const nodes = createNodes({ defineMeta: null })
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain('const meta = {}')
  })

  it('should generate correct stories object', () => {
    const nodes = createNodes()
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain('const stories = {')
    expect(result).toContain('Primary,')
    expect(result).toContain('export { stories }')
  })

  it('should import h and StoryRenderer', () => {
    const nodes = createNodes()
    const result = createAppendix(nodes, 'test.stories.vue')

    expect(result).toContain('import { h as __vueCsfH } from \'vue\'')
    expect(result).toContain('import { StoryRenderer } from \'sb-addon-vue-csf\'')
  })

  it('should use exportName to convert story names', () => {
    const nodes = createNodes({
      stories: [
        { name: 'My Story', props: {} },
      ],
    })
    const result = createAppendix(nodes, 'test.stories.vue')

    // storyNameToExportName('My Story') = 'MyStory'
    expect(result).toContain('export const MyStory = {')
    expect(result).toContain('name: "My Story"')
  })
})
