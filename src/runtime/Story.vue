<script setup lang="ts" generic="TArgs extends Record<string, any> = Record<string, any>">
import type { Slot, VNodeChild } from 'vue'
import type { StoryContext } from '../types.ts'
/**
 * Story component for Vue CSF
 *
 * This component is used to define stories in .stories.vue files.
 * It receives story configuration as props and renders the story content.
 */
import { computed, watch } from 'vue'
import { storyNameToExportName } from '../utils/identifier-utils.ts'
import { useStoryRenderer } from './contexts/renderer.ts'

const props = defineProps<{
  name?: string
  exportName?: string
  asChild?: boolean
  template?: (args: TArgs, context: StoryContext<TArgs>) => any
  play?: (context: any) => Promise<void> | void
  args?: Partial<TArgs>
  argTypes?: any
  parameters?: Record<string, any>
  tags?: string[]
  decorators?: any[]
  loaders?: any[]
  globals?: any
}>()

// Define typed slots for better type inference
const slots = defineSlots<{ default?: Slot, template?: (props: { args: TArgs, context: StoryContext<TArgs> }) => VNodeChild }>()

const exportName = computed(() => props.exportName ?? storyNameToExportName(props.name ?? 'Unnamed'))

// Get renderer context
const renderer = useStoryRenderer()

// Computed values from renderer context
const storyContext = computed<StoryContext<TArgs> | undefined>(() => renderer?.storyContext?.value as StoryContext<TArgs> | undefined)
const rendererArgs = computed<TArgs | undefined>(() => renderer?.args?.value as TArgs | undefined)

// Check if we're currently viewing this story
const isCurrentlyViewed = computed(() => {
  if (!renderer?.currentStoryExportName)
    return false
  return renderer.currentStoryExportName.value === exportName.value
})

// Inject play function into story context
watch(
  storyContext,
  (context) => {
    if (props.play && context && isCurrentlyViewed.value) {
      // Extend playFunction with the story's play function
      (context as any).playFunction = { __play: props.play }
    }
  },
  { immediate: true },
)

// Check if we have a template slot/render function
const hasTemplate = computed(() => {
  return !!(props.template || slots.template)
})

// Check if we have default slot
const hasDefaultSlot = computed(() => {
  return !!slots.default
})
</script>

<template>
  <template v-if="isCurrentlyViewed">
    <!-- Template mode: Use the provided template function -->
    <template v-if="hasTemplate">
      <slot
        name="template"
        :args="(rendererArgs ?? {}) as TArgs"
        :context="(storyContext ?? {}) as StoryContext<TArgs>"
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
