<script setup lang="ts">
/**
 * StoriesExtractor component
 * 
 * This component is used to extract story definitions from the stories file.
 * It mounts the stories component in extraction mode and collects all story
 * definitions without rendering them.
 */
import { provide, shallowRef, computed } from 'vue';
import type { Component } from 'vue';
import type { StoriesRepository } from './contexts/extractor.js';
import { EXTRACTOR_CONTEXT_KEY } from './contexts/extractor.js';
import type { StoryAnnotations, Cmp } from '../types.js';

interface Props {
  Stories: Component;
  repository: () => StoriesRepository<Cmp>;
}

const props = defineProps<Props>();

// Provide extractor context
const isExtracting = true;

const register = (story: StoryAnnotations<any, Cmp>) => {
  const repo = props.repository();
  const exportName = story.exportName || story.name || 'Unnamed';
  repo.stories.set(exportName, story);
};

provide(EXTRACTOR_CONTEXT_KEY, {
  isExtracting,
  register,
});
</script>

<template>
  <component :is="Stories" />
</template>
