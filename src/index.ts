/**
 * Vue CSF - Component Story Format for Vue
 *
 * This addon allows you to write Storybook stories in Vue Single File Component syntax.
 *
 * @example
 * ```vue
 * <script setup>
 * import { defineMeta } from 'sb-addon-vue-csf';
 * import MyComponent from './MyComponent.vue';
 *
 * const { Story } = defineMeta({
 *   title: 'MyComponent',
 *   component: MyComponent,
 * });
 * </script>
 *
 * <template>
 *   <Story name="Primary" :args="{ primary: true }" />
 * </template>
 * ```
 */

import type { Component, VNode } from 'vue'
import type { Cmp, Meta } from './types'
import { h } from 'vue'
import StoryComponent from './runtime/Story.vue'
import StoryRendererComponent from './runtime/StoryRenderer.vue'

export type { StoryContext } from './types'
export { StoryRendererComponent as StoryRenderer }

// Re-export types from ./types
export type {
  Cmp,
  Meta,
  StoriesRepository,
  StoryAnnotations,
  TemplateRenderFn,
} from './types'

// Re-export createReusableTemplate from VueUse for convenience
export { createReusableTemplate } from '@vueuse/core'

/**
 * Define metadata for a stories file
 *
 * @param _meta - Storybook meta configuration
 * @returns Object containing the Story component
 */
export function defineMeta<_TCmp extends Cmp>(
  _meta: Meta,
): {
  Story: typeof StoryComponent
} {
  return {
    Story: StoryComponent as typeof StoryComponent,
  }
}

/**
 * Infer args type from Story component
 */
export type Args<TStoryCmp> = TStoryCmp extends typeof StoryComponent
  ? Record<string, unknown>
  : never

/**
 * Create a render function for use with defineMeta's render option
 *
 * This helper creates a render function that renders a VueUse ReuseTemplate component.
 * Use this with createReusableTemplate to define a default template for all stories.
 *
 * @example
 * ```vue
 * <script lang="ts">
 * import { createReusableTemplate, createRenderTemplate } from 'sb-addon-vue-csf';
 * import Button from './Button.vue';
 *
 * const [DefineTemplate, ReuseTemplate] = createReusableTemplate();
 * export const defaultTemplate = createRenderTemplate(ReuseTemplate);
 * </script>
 *
 * <script setup>
 * const { Story } = defineMeta({
 *   title: 'Example/Button',
 *   component: Button,
 *   render: defaultTemplate,
 * });
 * </script>
 *
 * <template>
 *   <DefineTemplate v-slot="{ args }">
 *     <div class="wrapper">
 *       <Button v-bind="args" />
 *     </div>
 *   </DefineTemplate>
 *
 *   <Story name="Primary" :args="{ primary: true }" />
 * </template>
 * ```
 */
export function createRenderTemplate<TArgs = Record<string, unknown>>(
  reuseTemplate: Component,
): (args: TArgs) => VNode {
  return (args: TArgs) => h(reuseTemplate, { args })
}
