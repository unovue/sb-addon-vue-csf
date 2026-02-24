import type {
  AnnotatedStoryFn,
  Args,
  StoryContext as BaseStoryContext,
  StrictArgs,
} from '@storybook/csf'
import type { Component, VNodeChild } from 'vue'

/**
 * Vue component type
 */
export type Cmp = Component

/**
 * Story context with Vue-specific types
 */
export type StoryContext<TArgs = StrictArgs> = BaseStoryContext<any, TArgs> & {
  component?: Cmp
}

/**
 * Meta annotations for Vue CSF
 */
export interface Meta<TArgs = Args> {
  title?: string
  component?: Cmp
  subcomponents?: Record<string, Cmp>
  decorators?: any[]
  parameters?: Record<string, any>
  args?: Partial<TArgs>
  argTypes?: any
  tags?: string[]
  loaders?: any[]
  render?: any
  play?: any
  globals?: any
  moduleExport?: any
  beforeEach?: any
}

/**
 * Component annotations for Vue CSF
 */
export type ComponentAnnotations<_TCmp extends Cmp = Cmp, TArgs = Args> = Meta<TArgs>

/**
 * Story annotations for Vue CSF
 */
export interface StoryAnnotations<TArgs = Args, _TCmp = Cmp> {
  /**
   * Name of the story
   */
  name?: string
  /**
   * Export name of the story (used for variable name in exports)
   */
  exportName?: string
  /**
   * Render function for the story
   */
  render?: AnnotatedStoryFn<any, TArgs>
  /**
   * Play function for the story
   */
  play?: (context: any) => Promise<void> | void
  /**
   * Decorators for the story
   */
  decorators?: any[]
  /**
   * Parameters for the story
   */
  parameters?: Record<string, any>
  /**
   * Args for the story
   */
  args?: Partial<TArgs>
  /**
   * Arg types for the story
   */
  argTypes?: any
  /**
   * Tags for the story
   */
  tags?: string[]
  /**
   * Loaders for the story
   */
  loaders?: any[]
  /**
   * Globals for the story
   */
  globals?: any
  /**
   * Story function
   */
  story?: any
}

/**
 * Template render function type
 */
export type TemplateRenderFn<TArgs = Args> = (args: TArgs, context: StoryContext<TArgs>) => VNodeChild

/**
 * Stories repository for extraction
 */
export interface StoriesRepository<TCmp = Cmp> {
  stories: Map<string, StoryAnnotations<any, TCmp>>
}

/**
 * Options for the Vue CSF addon
 */
export interface VueCsfOptions {
  /**
   * Enable debug logging
   */
  debug?: boolean
}
