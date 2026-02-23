/**
 * Vue CSF - Component Story Format for Vue
 * 
 * This addon allows you to write Storybook stories in Vue Single File Component syntax.
 * 
 * @example
 * ```vue
 * <script setup>
 * import { defineMeta } from '@storybook/addon-vue-csf';
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

import StoryComponent from './runtime/Story.vue';
import type { Component, VNodeChild } from 'vue';
import type { Cmp, ComponentAnnotations } from './types.js';
import type { StoryContext } from './types.js';

export type { StoryContext } from './types.js';

/**
 * Define metadata for a stories file
 * 
 * @param meta - Storybook meta configuration
 * @returns Object containing the Story component
 */
export function defineMeta<TCmp extends Cmp>(
  meta: ComponentAnnotations<TCmp>
): {
  Story: typeof StoryComponent;
} {
  return {
    Story: StoryComponent as any,
  };
}

/**
 * Infer args type from Story component
 */
export type Args<TStoryCmp> = TStoryCmp extends typeof StoryComponent
  ? Record<string, any>
  : never;

/**
 * Re-export types
 */
export type {
  Cmp,
  Meta,
  StoryAnnotations,
  TemplateRenderFn,
  StoriesRepository,
} from './types.js';

// Re-export runtime components
export { default as Story } from './runtime/Story.vue';
