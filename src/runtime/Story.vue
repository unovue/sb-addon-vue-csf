<script setup lang="ts">
import type { Slot } from 'vue'
import type { Cmp, StoryAnnotations, StoryContext } from '../types.js'
/**
 * Story component for Vue CSF
 *
 * This component is used to define stories in .stories.vue files.
 * It receives story configuration as props and renders the story content.
 */
import { computed, onMounted, useSlots, watch } from 'vue'
import { storyNameToExportName } from '../utils/identifier-utils.js'
import { useStoriesExtractor } from './contexts/extractor.js'
import { useStoryRenderer } from './contexts/renderer.js'

interface StoryProps extends Partial<StoryAnnotations<any, Cmp>> {
  /**
   * Name of the story
   */
  name?: string
  /**
   * Export name of the story (used for variable name in exports)
   */
  exportName?: string
  /**
   * Render the children as the story content (static mode)
   */
  asChild?: boolean
  /**
   * Template render function
   */
  template?: (args: any, context: StoryContext) => any
}

const props = defineProps<StoryProps>()
const slots: { default?: Slot, template?: Slot } = useSlots()

const exportName = computed<string>(() => props.exportName ?? storyNameToExportName(props.name ?? 'Unnamed'))

// Get contexts
const extractor = useStoriesExtractor()
const renderer = useStoryRenderer()

// Computed values from renderer context
const storyContext = computed(() => renderer?.storyContext?.value)
const rendererArgs = computed(() => renderer?.args?.value)

// Check if we're currently viewing this story
const isCurrentlyViewed = computed<boolean>(() => {
  if (!renderer?.currentStoryExportName)
    return false
  const currentName = renderer.currentStoryExportName.value ?? renderer.currentStoryExportName
  return !extractor?.isExtracting && currentName === exportName.value
})

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
    })
  }
})

// Inject play function into story context
watch(
  () => storyContext.value,
  (context) => {
    if (props.play && context && isCurrentlyViewed.value) {
      // Extend playFunction with the story's play function
      (context as any).playFunction = { __play: props.play }
    }
  },
  { immediate: true },
)

// Check if we have a template slot/render function
const hasTemplate = computed<boolean>((): boolean => {
  return !!(props.template || slots.template)
})

// Check if we have default slot
const hasDefaultSlot = computed<boolean>((): boolean => {
  return !!slots.default
})
</script>

<template>
  <template v-if="isCurrentlyViewed">
    <!-- Template mode: Use the provided template function -->
    <template v-if="hasTemplate">
      <slot
        name="template"
        :args="rendererArgs"
        :context="storyContext"
      />
    </template>

    <!-- Default slot mode: Render children -->
    <template v-else-if="hasDefaultSlot">
      <!-- asChild: render children directly -->
      <template v-if="asChild">
        <slot />
      </template>

      <!-- Wrap children in component -->
      <template v-else-if="storyContext?.component">
        <component
          :is="storyContext.component"
          v-bind="rendererArgs"
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
    <template v-else-if="renderer?.metaRenderTemplate?.value">
      <component
        :is="renderer.metaRenderTemplate.value"
        :args="rendererArgs"
        :context="storyContext"
      />
    </template>

    <!-- Direct component rendering -->
    <template v-else-if="storyContext?.component">
      <component
        :is="storyContext.component"
        v-bind="rendererArgs"
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
