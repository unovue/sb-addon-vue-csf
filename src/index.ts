/**
 * Vue CSF - Component Story Format for Vue
 *
 * This addon allows you to write Storybook stories in Vue Single File Component syntax.
 *
 * @example
 * ```vue
 * <script setup>
 * import { defineMeta } from 'addon-vue-csf';
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

import type { Cmp, Meta } from './types'
import StoryComponent from './runtime/Story.vue'
import StoryRendererComponent from './runtime/StoryRenderer.vue'

export type { StoryContext } from './types'
export { StoryRendererComponent as StoryRenderer }

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
 * Re-export types
 */
export type {
  Cmp,
  Meta,
  StoriesRepository,
  StoryAnnotations,
  TemplateRenderFn,
} from './types'
