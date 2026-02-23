<script setup lang="ts">
import type { Component } from 'vue'
import type { StoryContext } from '../types.js'
/**
 * StoryRenderer component
 *
 * This component is responsible for rendering a single story.
 * It's used by the runtime story creator to render the currently selected story.
 */
import { computed, provide } from 'vue'
import { RENDERER_CONTEXT_KEY } from './contexts/renderer.js'

interface Props {
  exportName: string
  storiesComponent: Component
  storyContext: StoryContext
  args: Record<string, unknown>
  metaRenderTemplate?: (args: unknown, context: StoryContext) => unknown
}

const props = defineProps<Props>()

// Provide renderer context
const currentStoryExportName = computed(() => props.exportName)
const args = computed(() => props.args)
const storyContext = computed(() => props.storyContext)
const metaRenderTemplate = computed(() => props.metaRenderTemplate)

provide(RENDERER_CONTEXT_KEY, {
  currentStoryExportName,
  args,
  storyContext,
  metaRenderTemplate,
})
</script>

<template>
  <component :is="storiesComponent" />
</template>
