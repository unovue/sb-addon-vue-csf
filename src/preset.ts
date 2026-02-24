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
 * Optimize Vite dependencies
 */
export const optimizeViteDeps = ['sb-addon-vue-csf']
