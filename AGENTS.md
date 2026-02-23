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
├── parser/            # Vue SFC parsing and AST extraction
│   ├── ast.ts
│   └── extract/
│       ├── vue/       # Vue AST extraction
│       └── compiled/  # Compiled JS extraction
├── indexer/           # Storybook indexer
│   └── index.ts
├── runtime/           # Vue runtime components
│   ├── Story.vue
│   ├── StoriesExtractor.vue
│   ├── StoryRenderer.vue
│   └── contexts/
├── utils/             # Utility functions
├── types.ts           # TypeScript types
├── constants.ts       # Constants
├── index.ts           # Main entry point
└── preset.ts          # Storybook preset
```

## Development

```bash
# Install dependencies
pnpm install

# Start development mode
pnpm start

# Run tests
pnpm test

# Build
pnpm build

# Lint
pnpm run lint
pnpm run lint:fix
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
- The `Story.vue` component handles both extraction and rendering modes
- Contexts are used to communicate between the extractor/renderer and Story components
