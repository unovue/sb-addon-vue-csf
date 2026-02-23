/**
 * Renderer context for Vue CSF
 *
 * This context is used during rendering to provide story-specific
 * information to the Story components.
 */

import type { ComputedRef, InjectionKey } from 'vue'
import type { StoryContext } from '../../types.js'
import { inject, provide } from 'vue'

export interface RendererContext {
  currentStoryExportName: ComputedRef<string>
  args: ComputedRef<Record<string, any>>
  storyContext: ComputedRef<StoryContext>
  metaRenderTemplate?: ComputedRef<((args: any, context: StoryContext) => any) | undefined>
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
  return inject(RENDERER_CONTEXT_KEY)
}
