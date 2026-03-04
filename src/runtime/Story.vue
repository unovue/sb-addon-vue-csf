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
  play?: (context: StoryContext<TArgs>) => Promise<void> | void
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

// Rendering mode detection
const shouldRenderTemplate = computed(() => isCurrentlyViewed.value && !!slots.template)
const shouldRenderDefaultSlot = computed(() => isCurrentlyViewed.value && !slots.template && !!slots.default)
const shouldRenderMetaTemplate = computed(() => isCurrentlyViewed.value && !slots.template && !slots.default && !!renderer?.metaRenderTemplate?.value && !!storyContext.value)
const shouldRenderComponent = computed(() => isCurrentlyViewed.value && !slots.template && !slots.default && !renderer?.metaRenderTemplate?.value && !!storyContext.value?.component)

// Inject play function into story context
watch(
  storyContext,
  (context) => {
    if (props.play && context && isCurrentlyViewed.value) {
      const ctx = context as StoryContext<TArgs> & { playFunction?: { __play: typeof props.play } }
      ctx.playFunction = { __play: props.play }
    }
  },
  { immediate: true },
)
</script>

<template>
  <!-- Template mode: Use the provided template function -->
  <template v-if="shouldRenderTemplate">
    <slot
      name="template"
      :args="(rendererArgs ?? {}) as TArgs"
      :context="(storyContext ?? {}) as StoryContext<TArgs>"
    />
  </template>

  <!-- Default slot mode: Render children -->
  <template v-else-if="shouldRenderDefaultSlot">
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

  <!-- Meta render template (from defineMeta render option) -->
  <template v-else-if="shouldRenderMetaTemplate">
    <component
      :is="renderer!.metaRenderTemplate!.value!(rendererArgs, storyContext!)"
      :args="rendererArgs"
      :context="storyContext"
    />
  </template>

  <!-- Direct component rendering -->
  <template v-else-if="shouldRenderComponent">
    <component
      :is="storyContext!.component"
      v-bind="rendererArgs"
    />
  </template>

  <!-- No story rendered -->
  <template v-else-if="isCurrentlyViewed">
    <p>
      No story rendered for "{{ exportName }}". See
      <a href="https://github.com/unovue/sb-addon-vue-csf#defining-stories" target="_blank">
        the docs
      </a>
      on how to define stories.
    </p>
  </template>
</template>
