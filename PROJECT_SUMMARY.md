# Vue CSF Addon - Project Summary

## Overview

This project is a Storybook addon that allows developers to write Storybook stories using Vue Single File Component (SFC) syntax instead of traditional CSF JavaScript/TypeScript files.

## What Was Done

### 1. Core Architecture

#### Parser Layer (`src/parser/`)
- Uses Vue compiler (`@vue/compiler-sfc`)
- Files:
  - `ast.ts` - Parse Vue SFC files
  - `extract/vue/nodes.ts` - Extract defineMeta and Story nodes
  - `extract/compiled/nodes.ts` - Extract from compiled JS

#### Compiler Layer (`src/compiler/`)
- Vite plugins for transforming `.stories.vue` files
- Post-transform to generate CSF exports

#### Indexer (`src/indexer/`)
- Storybook indexer for discovering stories
- Creates index entries for sidebar navigation

#### Runtime Layer (`src/runtime/`)
- Vue components (`.vue`)
- Components:
  - `Story.vue` - Main Story component
  - `StoriesExtractor.vue` - Extracts story definitions
  - `StoryRenderer.vue` - Renders selected story
  - `contexts/` - Vue provide/inject contexts

### 2. API

#### Vue Syntax

```vue
<script setup>
import { defineMeta } from 'addon-vue-csf';
const { Story } = defineMeta({
  component: Button,
});
</script>

<template>
  <Story name="Primary" :args="{ primary: true }" />
</template>
```

### 3. Package Configuration

#### Dependencies
- `@vue/compiler-sfc`
- `@vitejs/plugin-vue`
- `@storybook/vue3-vite`
- Peer dependency on Vue 3.x

### 4. Project Structure

```
addon-vue-csf/
├── src/
│   ├── compiler/          # Vite plugins
│   │   ├── plugins.ts
│   │   └── post-transform/
│   ├── parser/            # Vue SFC parsing
│   │   ├── ast.ts
│   │   └── extract/
│   │       ├── vue/
│   │       └── compiled/
│   ├── indexer/           # Storybook indexer
│   ├── runtime/           # Vue components
│   │   ├── Story.vue
│   │   ├── StoriesExtractor.vue
│   │   └── StoryRenderer.vue
│   ├── utils/             # Utilities
│   ├── types.ts           # TypeScript types
│   ├── index.ts           # Entry point
│   └── preset.ts          # Storybook preset
├── examples/              # Example stories
├── tests/                 # Test files
└── .storybook/           # Storybook config
```

## How to Publish to GitHub

### Option 1: Create Repository via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# brew install gh  # macOS
# winget install --id GitHub.cli  # Windows

# Authenticate
gh auth login

# Create repository
cd /Users/zernonia/Desktop/UnoVue/addon-vue-csf
gh repo create addon-vue-csf --public --source=. --remote=origin --push
```

### Option 2: Create Repository via Web + Git Commands

1. Go to https://github.com/new
2. Create a new repository named `addon-vue-csf`
3. Run these commands:

```bash
cd /Users/zernonia/Desktop/UnoVue/addon-vue-csf
git remote add origin https://github.com/YOUR_USERNAME/addon-vue-csf.git
git branch -M main
git push -u origin main
```

## Development Setup

```bash
# Install dependencies
pnpm install

# Start development (builds and runs Storybook)
pnpm start

# Run tests
pnpm test

# Build for production
pnpm build

# Lint
pnpm run lint
pnpm run lint:fix
```

## Usage in Projects

```bash
# Install the addon
npm install --save-dev addon-vue-csf

# Update main.ts
export default {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx|vue)'],
  addons: [
    'addon-vue-csf',
    // ... other addons
  ],
}
```

## Key Files to Review

1. **Entry Point**: `src/index.ts` - Exports `defineMeta` and `Story`
2. **Preset**: `src/preset.ts` - Configures Vite plugins and indexer
3. **Story Component**: `src/runtime/Story.vue` - Main story definition component
4. **Parser**: `src/parser/ast.ts` - Vue SFC parsing
5. **Compiler Plugin**: `src/compiler/plugins.ts` - Vite transformation

## Known Limitations / TODOs

1. The parser currently uses regex-based extraction - could be improved with proper AST traversal
2. Template slot rendering could be enhanced for more complex use cases
3. TypeScript type inference could be improved for args
4. Legacy template support is not yet implemented
