<script setup lang="ts">
import type { Component } from 'vue'
import type { Cmp, StoryAnnotations } from '../types.js'
import type { StoriesRepository } from './contexts/extractor.js'
/**
 * StoriesExtractor component
 *
 * This component is used to extract story definitions from the stories file.
 * It mounts the stories component in extraction mode and collects all story
 * definitions without rendering them.
 */
import { provide } from 'vue'
import { EXTRACTOR_CONTEXT_KEY } from './contexts/extractor.js'

interface Props {
  storiesComponent: Component
  repository: () => StoriesRepository<Cmp>
}

const props = defineProps<Props>()

// Provide extractor context
const isExtracting = true

function register(story: StoryAnnotations<any, Cmp>) {
  const repo = props.repository()
  const exportName = story.exportName || story.name || 'Unnamed'
  repo.stories.set(exportName, story)
}

provide(EXTRACTOR_CONTEXT_KEY, {
  isExtracting,
  register,
})
</script>

<template>
  <component :is="storiesComponent" />
</template>
