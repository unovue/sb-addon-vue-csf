import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/tests/**', '**/examples/**', '**/.storybook/**'],
    }),
  ],
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        preset: resolve(__dirname, 'src/preset.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        'fs',
        'node:fs',
        'node:path',
        '@storybook/vue3',
        '@storybook/csf',
        'storybook/internal/types',
        'vite',
        '@vitejs/plugin-vue',
        '@vue/compiler-sfc',
        'magic-string',
        'dedent',
      ],
    },
    sourcemap: true,
  },
})
