import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../examples/**/*.stories.vue'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '../src/preset.ts',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
}

export default config
