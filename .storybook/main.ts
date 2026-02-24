import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../examples/**/*.stories.vue'],
  addons: [
    // '@storybook/addon-docs',
    // '@storybook/addon-vitest',
    '../dist/preset.js',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: 'vue-component-meta',
    },
  },
}

export default config
