import type { StorybookConfig } from '@storybook/vue3-vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: [
    '../examples/**/*.stories.vue',
    '../examples/**/*.stories.ts',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    'addon-vue-csf',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Configure path aliases to match tsconfig.json
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': resolve(__dirname, '../examples'),
      },
    }
    return config
  },
}

export default config
