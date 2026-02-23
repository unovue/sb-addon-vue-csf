<script setup lang="ts">
/**
 * StoryRenderer component
 * 
 * This component is responsible for rendering a single story.
 * It's used by the runtime story creator to render the currently selected story.
 */
import { provide, computed, shallowRef } from 'vue';
import type { Component } from 'vue';
import { RENDERER_CONTEXT_KEY } from './contexts/renderer.js';
import type { StoryContext, Cmp } from '../types.js';

interface Props {
  exportName: string;
  Stories: Component;
  storyContext: StoryContext;
  args: Record<string, any>;
  metaRenderTemplate?: (args: any, context: StoryContext) => any;
}

const props = defineProps<Props>();

// Provide renderer context
const currentStoryExportName = computed(() => props.exportName);
const args = computed(() => props.args);
const storyContext = computed(() => props.storyContext);
const metaRenderTemplate = computed(() => props.metaRenderTemplate);

provide(RENDERER_CONTEXT_KEY, {
  currentStoryExportName,
  args,
  storyContext,
  metaRenderTemplate,
});
</script>

<template>
  <component :is="Stories" />
</template>
