/**
 * Renderer context for Vue CSF
 *
 * This context is used during rendering to provide story-specific
 * information to the Story components.
 */

import type { InjectionKey, Ref } from 'vue'
import type { StoryContext } from '../../types.ts'
import { inject, provide } from 'vue'

export interface RendererContext {
  currentStoryExportName: Ref<string>
  args: Ref<Record<string, any>>
  storyContext: Ref<StoryContext>
  metaRenderTemplate?: Ref<((args: any, context: StoryContext) => any) | undefined>
}

export const RENDERER_CONTEXT_KEY: InjectionKey<RendererContext> = Symbol('vue-csf-renderer')

/**
 * Provide the renderer context
 */
export function provideRendererContext(context: RendererContext): void {
  provide(RENDERER_CONTEXT_KEY, context)
}

/**
 * Use the renderer context
 */
export function useStoryRenderer(): RendererContext | undefined {
  return inject(RENDERER_CONTEXT_KEY, undefined)
}
