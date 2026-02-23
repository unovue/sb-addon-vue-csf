import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      '$lib': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        preset: resolve(__dirname, 'src/preset.ts'),
        'runtime/create-runtime-stories': resolve(__dirname, 'src/runtime/create-runtime-stories.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@storybook/vue3',
        '@storybook/csf',
        'storybook/internal/types',
        'vite',
        '@vitejs/plugin-vue',
        '@vue/compiler-sfc',
        'magic-string',
        'esrap',
        'es-toolkit',
        'dedent',
        'zimmerframe',
      ],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
  },
});
