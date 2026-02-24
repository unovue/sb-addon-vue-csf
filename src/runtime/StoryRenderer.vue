<script setup lang="ts">
import type { Component } from 'vue'
import type { StoryContext } from '../types.ts'
/**
 * StoryRenderer component
 *
 * This component is responsible for rendering a single story.
 * It's used by the runtime story creator to render the currently selected story.
 */
import { provide, toRefs } from 'vue'
import { RENDERER_CONTEXT_KEY } from './contexts/renderer.ts'

interface Props {
  exportName: string
  storiesComponent: Component
  storyContext: StoryContext
  args: Record<string, unknown>
  metaRenderTemplate?: (args: unknown, context: StoryContext) => unknown
}

const props = defineProps<Props>()

// Provide renderer context
const { exportName, args, storyContext, metaRenderTemplate } = toRefs(props)

provide(RENDERER_CONTEXT_KEY, {
  currentStoryExportName: exportName,
  args,
  storyContext,
  metaRenderTemplate,
})
</script>

<template>
  <component :is="storiesComponent" />
</template>
