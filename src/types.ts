/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component, VNodeChild } from 'vue';
import type {
  AnnotatedStoryFn,
  Args,
  ComponentAnnotations,
  StoryAnnotations as BaseStoryAnnotations,
  StrictArgs,
  StoryContext as BaseStoryContext,
} from '@storybook/csf';

/**
 * Vue component type
 */
export type Cmp = Component;

/**
 * Story context with Vue-specific types
 */
export interface StoryContext<TArgs = StrictArgs> extends BaseStoryContext<Cmp, TArgs> {
  component?: Cmp;
}

/**
 * Meta annotations for Vue CSF
 */
export type Meta<TArgs = Args> = ComponentAnnotations<Cmp, TArgs>;

/**
 * Story annotations for Vue CSF
 */
export interface StoryAnnotations<TArgs = Args, TCmp = Cmp> extends BaseStoryAnnotations<Cmp, TArgs> {
  /**
   * Name of the story
   */
  name?: string;
  /**
   * Export name of the story (used for variable name in exports)
   */
  exportName?: string;
  /**
   * Render function for the story
   */
  render?: AnnotatedStoryFn<Cmp, TArgs>;
  /**
   * Play function for the story
   */
  play?: (context: StoryContext<TArgs>) => Promise<void> | void;
}

/**
 * Template render function type
 */
export type TemplateRenderFn<TArgs = Args> = (args: TArgs, context: StoryContext<TArgs>) => VNodeChild;

/**
 * Stories repository for extraction
 */
export interface StoriesRepository<TCmp = Cmp> {
  stories: Map<string, StoryAnnotations<any, TCmp>>;
}

/**
 * Options for the Vue CSF addon
 */
export interface VueCsfOptions {
  /**
   * Enable debug logging
   */
  debug?: boolean;
}
