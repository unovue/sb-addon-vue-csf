<script setup lang="ts" generic="TArgs extends Record<string, any>">
/**
 * Story component for Vue CSF
 * 
 * This component is used to define stories in .stories.vue files.
 * It receives story configuration as props and renders the story content.
 */
import { computed, useSlots, watch, onMounted } from 'vue';
import { useStoriesExtractor } from './contexts/extractor.js';
import { useStoryRenderer } from './contexts/renderer.js';
import { storyNameToExportName } from '../utils/identifier-utils.js';
import type { StoryAnnotations, StoryContext, Cmp } from '../types.js';

interface Props extends Partial<StoryAnnotations<TArgs, Cmp>> {
  /**
   * Name of the story
   */
  name?: string;
  /**
   * Export name of the story (used for variable name in exports)
   */
  exportName?: string;
  /**
   * Render the children as the story content (static mode)
   */
  asChild?: boolean;
  /**
   * Template render function
   */
  template?: (args: TArgs, context: StoryContext<TArgs>) => any;
}

const props = defineProps<Props>();
const slots = useSlots();

const exportName = computed(() => props.exportName ?? storyNameToExportName(props.name ?? 'Unnamed'));

// Get contexts
const extractor = useStoriesExtractor();
const renderer = useStoryRenderer();

// Check if we're currently viewing this story
const isCurrentlyViewed = computed(() => {
  return !extractor?.isExtracting && renderer?.currentStoryExportName === exportName.value;
});

// Register with extractor if in extraction mode
onMounted(() => {
  if (extractor?.isExtracting) {
    extractor.register({
      name: props.name,
      exportName: exportName.value,
      args: props.args,
      parameters: props.parameters,
      tags: props.tags,
      play: props.play,
    });
  }
});

// Inject play function into story context
watch(
  () => renderer?.storyContext,
  (context) => {
    if (props.play && context && isCurrentlyViewed.value) {
      // @ts-expect-error - extending playFunction
      context.playFunction = { __play: props.play };
    }
  },
  { immediate: true }
);

// Check if we have a template slot/render function
const hasTemplate = computed(() => {
  return props.template || slots.template;
});

// Check if we have default slot
const hasDefaultSlot = computed(() => {
  return !!slots.default;
});
</script>

<template>
  <template v-if="isCurrentlyViewed">
    <!-- Template mode: Use the provided template function -->
    <template v-if="hasTemplate">
      <slot
        name="template"
        :args="renderer?.args"
        :context="renderer?.storyContext"
      />
    </template>
    
    <!-- Default slot mode: Render children -->
    <template v-else-if="hasDefaultSlot">
      <!-- asChild: render children directly -->
      <template v-if="asChild">
        <slot />
      </template>
      
      <!-- Wrap children in component -->
      <template v-else-if="renderer?.storyContext?.component">
        <component
          :is="renderer.storyContext.component"
          v-bind="renderer.args"
        >
          <slot />
        </component>
      </template>
      
      <!-- Fallback: render children directly -->
      <template v-else>
        <slot />
      </template>
    </template>
    
    <!-- Meta render template -->
    <template v-else-if="renderer?.metaRenderTemplate">
      <component
        :is="renderer.metaRenderTemplate"
        :args="renderer.args"
        :context="renderer.storyContext"
      />
    </template>
    
    <!-- Direct component rendering -->
    <template v-else-if="renderer?.storyContext?.component">
      <component
        :is="renderer.storyContext.component"
        v-bind="renderer.args"
      />
    </template>
    
    <!-- No story rendered -->
    <template v-else>
      <p>
        No story rendered. See
        <a href="https://github.com/storybookjs/addon-vue-csf#defining-stories" target="_blank">
          the docs
        </a>
        on how to define stories.
      </p>
    </template>
  </template>
</template>
