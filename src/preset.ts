/* eslint-disable ts/no-unsafe-function-type */
/**
 * Storybook preset for Vue CSF addon
 *
 * This preset configures Storybook to work with Vue CSF stories files.
 * It adds:
 * 1. Vite plugins for transforming .stories.vue files
 * 2. Indexer for discovering stories
 */

import type { StorybookConfig } from '@storybook/vue3-vite'
import type { Options } from 'storybook/internal/types'
import { transformPlugin } from './compiler/plugins'
import { createIndexer } from './indexer/index'

export interface StorybookAddonVueCsfOptions extends Options {
  /**
   * Enable debug logging
   */
  debug?: boolean
}

/**
 * Vite configuration hook
 * Adds the Vue CSF transform plugin to Vite
 */
export const viteFinal: StorybookConfig['viteFinal'] = async (
  config,

  _options: StorybookAddonVueCsfOptions,
) => {
  const { plugins = [], ...restConfig } = config

  // Add main transform plugin
  plugins.push(await transformPlugin())

  return {
    ...restConfig,
    plugins,
  }
}

/**
 * Experimental indexers hook
 * Adds the Vue CSF indexer for discovering .stories.vue files
 */
export const experimental_indexers: StorybookConfig['experimental_indexers'] = (
  indexers,
  _options: StorybookAddonVueCsfOptions,
) => {
  return [createIndexer(), ...(indexers || [])]
}

/**
 * Server channel hook
 * Intercepts SAVE_STORY_REQUEST for .stories.vue files
 * and handles them with Vue-aware parsing instead of Babel.
 *
 * Core's preset runs before ours and registers a Babel-based handler that
 * can't parse Vue SFCs. We replace any already-registered saveStoryRequest
 * listeners with wrappers that skip .stories.vue files, then register our
 * own Vue-aware handler.
 */
export async function experimental_serverChannel(channel: any) {
  const { initializeSaveStory } = await import('./save-story/index')

  // Wrap any EXISTING saveStoryRequest listeners (e.g. core's Babel handler)
  // to skip .stories.vue files — we handle those ourselves.
  const EVENT_NAME = 'saveStoryRequest'
  const existingListeners: Function[] = channel.events?.[EVENT_NAME]
  if (existingListeners?.length) {
    channel.events[EVENT_NAME] = existingListeners.map((listener: Function) => {
      return (data: any) => {
        if (data?.payload?.importPath?.endsWith('.stories.vue'))
          return
        return listener(data)
      }
    })
  }

  // Register our Vue-aware handler
  initializeSaveStory(channel)

  return channel
}

/**
 * Optimize Vite dependencies
 */
export const optimizeViteDeps = ['sb-addon-vue-csf']
