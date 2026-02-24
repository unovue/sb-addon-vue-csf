import { parse } from '@vue/compiler-sfc'
import { describe, expect, it } from 'vitest'
import { extractVueASTNodes } from './nodes.js'

function createAst(code: string) {
  const { descriptor, errors } = parse(code, { filename: 'test.stories.vue' })
  return { descriptor, errors }
}

describe('extractStories from AST', () => {
  it('should extract stories with static name attribute', async () => {
    const code = `<template>
  <Story name="Primary" />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].name).toBe('Primary')
    expect(nodes.stories[0].exportName).toBe('Primary')
  })

  it('should extract stories with args', async () => {
    const code = `<template>
  <Story name="Primary" :args="{ primary: true, label: 'Button' }" />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].name).toBe('Primary')
    expect(nodes.stories[0].props.args).toEqual({ primary: true, label: 'Button' })
  })

  it('should extract multiple stories', async () => {
    const code = `<template>
  <Story name="Primary" :args="{ primary: true }" />
  <Story name="Secondary" :args="{ secondary: true }" />
  <Story name="Large" :args="{ size: 'large' }" />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(3)
    expect(nodes.stories[0].name).toBe('Primary')
    expect(nodes.stories[1].name).toBe('Secondary')
    expect(nodes.stories[2].name).toBe('Large')
  })

  it('should handle asChild attribute', async () => {
    const code = `<template>
  <Story name="Custom" asChild :args="{ label: 'Test' }" />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].props.asChild).toBe(true)
  })

  it('should handle multiline args', async () => {
    const code = `<template>
  <Story
    name="Primary"
    :args="{
      primary: true,
      label: 'Button',
      size: 'large'
    }"
  />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].props.args).toEqual({
      primary: true,
      label: 'Button',
      size: 'large',
    })
  })

  it('should handle story without name (defaults to empty string)', async () => {
    const code = `<template>
  <Story :args="{ label: 'Test' }" />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].name).toBe('')
  })

  it('should handle empty template', async () => {
    const code = `<template>
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(0)
  })

  it('should handle stories with nested templates', async () => {
    const code = `<template>
  <div>
    <Story name="Nested" :args="{ label: 'Test' }" />
  </div>
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].name).toBe('Nested')
  })

  it('should extract custom exportName from static attribute', async () => {
    const code = `<template>
  <Story export-name="CustomExport" :args="{ label: 'Test' }" />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].exportName).toBe('CustomExport')
    expect(nodes.stories[0].name).toBe('')
  })

  it('should use name as exportName when only name is provided', async () => {
    const code = `<template>
  <Story name="My Story" :args="{ label: 'Test' }" />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].name).toBe('My Story')
    expect(nodes.stories[0].exportName).toBe('My Story')
  })

  it('should prioritize exportName over name for export name', async () => {
    const code = `<template>
  <Story name="My Story!" export-name="MyStoryClean" :args="{ label: 'Test' }" />
</template>`

    const ast = createAst(code)
    const nodes = await extractVueASTNodes({ ast, filename: 'test.stories.vue' })

    expect(nodes.stories).toHaveLength(1)
    expect(nodes.stories[0].name).toBe('My Story!')
    expect(nodes.stories[0].exportName).toBe('MyStoryClean')
  })
})
