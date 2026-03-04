import { describe, expect, it, vi } from 'vitest'
import { createIndexer } from './index'

// Mock fs to avoid reading actual files
vi.mock('node:fs', () => ({
  readFileSync: vi.fn((fileName: string) => {
    const files: Record<string, string> = {
      'Button.stories.vue': `<script setup>
import { defineMeta } from 'sb-addon-vue-csf'
import Button from './Button.vue'
const { Story } = defineMeta({ title: 'Example/Button', component: Button })
</script>
<template>
  <Story name="Primary" :args="{ primary: true }" />
  <Story name="Secondary" :args="{ secondary: true }" />
</template>`,
      'Empty.stories.vue': `<script setup>
import { defineMeta } from 'sb-addon-vue-csf'
const { Story } = defineMeta({ title: 'Empty' })
</script>
<template>
</template>`,
      'NoTitle.stories.vue': `<script setup>
import { defineMeta } from 'sb-addon-vue-csf'
const { Story } = defineMeta({})
</script>
<template>
  <Story name="Default" />
</template>`,
    }
    const content = files[fileName]
    if (!content) throw new Error(`File not found: ${fileName}`)
    return content
  }),
}))

describe('createIndexer', () => {
  it('should return indexer with correct test regex', () => {
    const indexer = createIndexer()

    expect(indexer.test).toEqual(/\.stories\.vue$/)
    expect(indexer.test.test('Button.stories.vue')).toBe(true)
    expect(indexer.test.test('Button.vue')).toBe(false)
    expect(indexer.test.test('Button.stories.ts')).toBe(false)
  })

  it('should extract stories with correct metadata', async () => {
    const indexer = createIndexer()
    const makeTitle = (name?: string) => name ?? ''

    const stories = await indexer.createIndex('Button.stories.vue', { makeTitle })

    expect(stories).toHaveLength(2)
    expect(stories[0]).toMatchObject({
      type: 'story',
      importPath: 'Button.stories.vue',
      exportName: 'Primary',
      name: 'Primary',
      title: 'Example/Button',
    })
    expect(stories[1]).toMatchObject({
      type: 'story',
      exportName: 'Secondary',
      name: 'Secondary',
    })
  })

  it('should generate default story when no stories defined', async () => {
    const indexer = createIndexer()
    const makeTitle = vi.fn((_name?: string) => 'Fallback/Title')

    const stories = await indexer.createIndex('Empty.stories.vue', { makeTitle })

    expect(stories).toHaveLength(1)
    expect(stories[0]).toMatchObject({
      type: 'story',
      exportName: 'Default',
      name: 'Default',
    })
  })

  it('should use makeTitle when no explicit title', async () => {
    const indexer = createIndexer()
    const makeTitle = vi.fn((_name?: string) => 'Generated/Title')

    const stories = await indexer.createIndex('NoTitle.stories.vue', { makeTitle })

    expect(makeTitle).toHaveBeenCalledWith('NoTitle.stories.vue')
    expect(stories[0].title).toBe('Generated/Title')
  })
})
