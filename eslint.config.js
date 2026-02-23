import antfu from '@antfu/eslint-config'

export default antfu({
  // Enable Vue support
  vue: true,

  // Enable TypeScript support
  typescript: true,

  // Enable formatting
  formatters: {
    css: true,
    html: true,
    markdown: true,
  },

  // Custom rules
  rules: {
    // Allow console in this project (it's a dev tool)
    'no-console': 'off',

    // Allow any type (this is a complex library with many generic types)
    '@typescript-eslint/no-explicit-any': 'off',

    // Allow unused vars prefixed with underscore
    'unused-imports/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],

    // Vue specific rules
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',

    // Node.js specific - allow process.env
    'node/prefer-global/process': 'off',
  },

  // Ignore patterns
  ignores: [
    'dist/',
    'node_modules/',
    'storybook-static/',
    '*.md',
    'pnpm-lock.yaml',
  ],
})
