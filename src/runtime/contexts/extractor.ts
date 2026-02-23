/**
 * Extractor context for Vue CSF
 * 
 * This context is used during the extraction phase to collect
 * story definitions without rendering them.
 */

import { inject, provide, type InjectionKey, type Ref } from 'vue';
import type { StoryAnnotations, Cmp } from '../../types.js';

export interface StoriesRepository<TCmp = Cmp> {
  stories: Map<string, StoryAnnotations<any, TCmp>>;
}

export interface ExtractorContext {
  isExtracting: boolean;
  register: (story: StoryAnnotations<any, Cmp>) => void;
}

export const EXTRACTOR_CONTEXT_KEY: InjectionKey<ExtractorContext> = Symbol('vue-csf-extractor');

/**
 * Provide the extractor context
 */
export function provideExtractorContext(context: ExtractorContext): void {
  provide(EXTRACTOR_CONTEXT_KEY, context);
}

/**
 * Use the extractor context
 */
export function useStoriesExtractor(): ExtractorContext | undefined {
  return inject(EXTRACTOR_CONTEXT_KEY);
}
