import { describe, expect, it } from 'vitest'
import { getVueSfcAST, isVueStoriesFile } from './ast.ts'

describe('ast', () => {
  describe('isVueStoriesFile', () => {
    it('should return true for .stories.vue files', () => {
      expect(isVueStoriesFile('Button.stories.vue')).toBe(true)
      expect(isVueStoriesFile('src/components/Button.stories.vue')).toBe(true)
    })

    it('should return false for non-stories files', () => {
      expect(isVueStoriesFile('Button.vue')).toBe(false)
      expect(isVueStoriesFile('Button.svelte')).toBe(false)
      expect(isVueStoriesFile('Button.ts')).toBe(false)
    })
  })

  describe('getVueSfcAST', () => {
    it('should parse a Vue SFC', () => {
      const code = `
<script setup>
import { defineMeta } from 'sb-addon-vue-csf';
const { Story } = defineMeta({
  title: 'Example/Button',
});
</script>

<template>
  <Story name="Primary" />
</template>
      `

      const ast = getVueSfcAST({ code, filename: 'test.stories.vue' })

      expect(ast.errors).toHaveLength(0)
      expect(ast.descriptor.scriptSetup).toBeDefined()
      expect(ast.descriptor.template).toBeDefined()
    })

    it('should parse a Vue SFC with script tag', () => {
      const code = `
<script>
export default {
  name: 'MyComponent'
}
</script>

<template>
  <div>Hello</div>
</template>
      `

      const ast = getVueSfcAST({ code, filename: 'test.vue' })

      expect(ast.errors).toHaveLength(0)
      expect(ast.descriptor.script).toBeDefined()
      expect(ast.descriptor.template).toBeDefined()
    })
  })
})
