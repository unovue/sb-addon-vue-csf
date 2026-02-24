# Agent Guide for addon-vue-csf

## Project Overview

This is a Storybook addon that allows writing stories in Vue Single File Component (SFC) syntax.

## Architecture

The addon consists of several key components:

### 1. Parser (`src/parser/`)
- Uses `@vue/compiler-sfc` to parse Vue SFC files
- Extracts `defineMeta` calls and `Story` components
- Generates AST nodes for transformation

### 2. Compiler (`src/compiler/`)
- Vite plugins that transform `.stories.vue` files
- `transformPlugin`: Main transformation after Vue compilation
- `preTransformPlugin`: Optional legacy support
- Post-transform: Generates CSF exports appendix

### 3. Indexer (`src/indexer/`)
- Storybook indexer for discovering stories
- Creates index entries for Storybook's sidebar

### 4. Runtime (`src/runtime/`)
- Vue components: `Story.vue`, `StoriesExtractor.vue`, `StoryRenderer.vue`
- Contexts: Extractor and Renderer contexts for state management
- `create-runtime-stories.ts`: Creates runtime story objects

### 5. Preset (`src/preset.ts`)
- Storybook configuration hooks
- Registers Vite plugins and indexers

## File Structure

```
src/
├── compiler/          # Vite plugins and code transformation
│   ├── plugins.ts
│   └── post-transform/
│       ├── index.ts
│       ├── create-appendix.ts
│       └── remove-export-default.ts
├── parser/            # Vue SFC parsing and AST extraction
│   ├── ast.ts
│   └── extract/
│       ├── vue/       # Vue AST extraction
│       └── compiled/  # Compiled JS extraction
├── indexer/           # Storybook indexer
│   └── index.ts
├── runtime/           # Vue runtime components
│   ├── Story.vue
│   ├── StoryRenderer.vue
│   └── contexts/
│       └── renderer.ts
├── utils/             # Utility functions
│   └── identifier-utils.ts
├── types.ts           # TypeScript types
├── constants.ts       # Constants
├── index.ts           # Main entry point
└── preset.ts          # Storybook preset
```

## Development

### Important: Development Workflow

When making changes to the addon source code (`src/*`), you **MUST** follow this workflow:

1. **Build the addon** after any changes to `src/*`:
   ```bash
   pnpm build
   ```

2. **Restart Storybook** to pick up the new build:
   ```bash
   # Stop the current Storybook server (Ctrl+C)
   # Then restart it
   pnpm storybook
   ```

3. **Why this is necessary**: Storybook references the static `dist/` folder, and Vite's cache can cause stale builds. Simply saving files won't reflect changes automatically.

### Available Scripts

```bash
# Install dependencies
pnpm install

# Start development mode (build + watch + storybook)
# Note: This may not reliably pick up all changes
pnpm start

# Run tests
pnpm test

# Build the addon
pnpm build

# Build and watch for changes
pnpm dev

# Lint
pnpm run lint
pnpm run lint:fix

# Clean cache and dist
pnpm run clean
```

## Story Format

```vue
<script setup>
import { defineMeta } from 'addon-vue-csf';
import Button from './Button.vue';

const { Story } = defineMeta({
  title: 'Example/Button',
  component: Button,
});
</script>

<template>
  <Story name="Primary" :args="{ primary: true }" />
</template>
```

## Notes for AI Agents

- When modifying parser code, ensure both `extract/vue/nodes.ts` and `extract/compiled/nodes.ts` are updated
- The transform plugin runs AFTER Vue compiles the SFC
- Runtime components use Vue 3 Composition API with `<script setup>`
- The `Story.vue` component uses renderer context to know which story to render
- Controls work by passing `argTypes` in `defineMeta` - they are preserved in the raw source code
