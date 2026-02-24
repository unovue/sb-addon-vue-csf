import { resolve } from 'node:path'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const { playwright } = await import('@vitest/browser-playwright')
  const storybookPlugin = await storybookTest({
    configDir: resolve(__dirname, '.storybook'),
    storybookScript: 'pnpm storybook --ci',
  })

  return {
    plugins: [
      vue(),
      storybookPlugin,
    ],
    resolve: {
      alias: {
        '$lib': resolve(__dirname, 'src'),
        '@': resolve(__dirname, 'examples'),
      },
    },
    test: {
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' }],
      },
      setupFiles: ['.storybook/vitest.setup.ts'],
    },
  }
})
