# addon-vue-csf

This Storybook addon allows you to write Storybook stories using Vue Single File Component syntax instead of ESM that regular CSF is based on.

```bash
npx storybook@latest add addon-vue-csf
```

Using Vue SFC syntax makes it easier to write stories for Vue components with proper template support, slots, and composition patterns.

## 🐣 Getting Started

### Installation

The easiest way to install the addon is with `storybook add`:

```bash
npx storybook@latest add addon-vue-csf
```

You can also add the addon manually. First, install the package:

```bash
npm install --save-dev addon-vue-csf
```

Then modify your `main.ts` Storybook configuration to include the addon and include `*.stories.vue` files:

```diff
export default {
-  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
+  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx|vue)'],
  addons: [
+    'addon-vue-csf',
    ...
  ],
  ...
}
```

Restart your Storybook server for the changes to take effect.

## 🐓 Usage

Vue CSF stories files must always have the `.stories.vue` extension.

### Defining the meta

All stories files must have a "meta" (aka. "default export") defined, and its structure follows what's described in [the official docs on the subject](https://storybook.js.org/docs/api/csf#default-export). To define the meta in Vue CSF, call the `defineMeta` function **within the script setup**, with the meta properties you want:

```vue
<script setup>
import { defineMeta } from 'addon-vue-csf';
import MyComponent from './MyComponent.vue';

//      👇 Get the Story component from the return value
const { Story } = defineMeta({
  title: 'Path/To/MyComponent',
  component: MyComponent,
  decorators: [
    /* ... */
  ],
  parameters: {
    /* ... */
  },
});
</script>
```

`defineMeta` returns an object with a `Story` component (see [Defining stories](#defining-stories) below) that you must destructure out to use.

### Defining stories

To define stories, you use the `Story` component returned from the `defineMeta` function. All properties of [a regular CSF story](https://storybook.js.org/docs/api/csf#named-story-exports) are passed as props to the `Story` component.

All story requires either the `name` prop or `exportName` prop.

#### Plain Story

If your component only accepts props and doesn't require slots, you can use the simple form of defining stories, only using args:

```vue
<template>
  <Story name="Primary" :args="{ primary: true }" />
</template>
```

This will render the component defined in the meta, with the args passed as props.

#### With children (default slot)

If your component needs children, you can pass them in directly to the story:

```vue
<template>
  <Story name="With Children">
    I will be the child of the component from defineMeta
  </Story>
</template>
```

#### Static template (asChild)

If you need more customization of the story, like composing components, you can set the `asChild` prop on the Story. Instead of forwarding the children to your component, it will instead use the children directly as the story output:

```vue
<template>
  <Story name="Composed" asChild>
    <MyComponent>
      <AChild label="Hello world!" />
    </MyComponent>
  </Story>
</template>
```

> [!IMPORTANT]
> This format completely ignores args, as they are not passed down to any of the child components defined. Even if your story has args and Controls, they won't have an effect.

#### With template slot

If you need composition but also want a dynamic story that reacts to args, you can define a template slot in the `Story` component:

```vue
<template>
  <Story name="Simple Template" :args="{ simpleChild: true }">
    <template #template="{ args, context }">
      <MyComponent v-bind="args">Component with args</MyComponent>
    </template>
  </Story>
</template>
```

#### Default template at meta level

If you only need a single template that you want to share among multiple stories, define it at the meta level:

```vue
<script setup>
import { defineMeta } from 'addon-vue-csf';
import MyComponent from './MyComponent.vue';

const { Story } = defineMeta({
  title: 'MyComponent',
  component: MyComponent,
  render: template,
});

// Define the default template
function template(args) {
  return {
    components: { MyComponent },
    setup() {
      return { args };
    },
    template: '<MyComponent v-bind="args" />',
  };
}
</script>

<template>
  <Story name="Primary" :args="{ variant: 'primary' }" />
  <Story name="Secondary" :args="{ variant: 'secondary' }" />
</template>
```

#### Reusable templates with `createReusableTemplate`

For more complex scenarios, you can use `createReusableTemplate` (re-exported from VueUse) combined with `createRenderTemplate` to define reusable templates:

```vue
<script lang="ts">
import { createReusableTemplate, createRenderTemplate } from 'addon-vue-csf';
import Button from './Button.vue';

const [DefineTemplate, ReuseTemplate] = createReusableTemplate();
export const defaultTemplate = createRenderTemplate(ReuseTemplate);
</script>

<script setup>
const { Story } = defineMeta({
  title: 'Example/Button',
  component: Button,
  render: defaultTemplate,
});
</script>

<template>
  <DefineTemplate v-slot="{ args }">
    <div class="wrapper">
      <Button v-bind="args" />
    </div>
  </DefineTemplate>

  <Story name="Primary" :args="{ primary: true }" />
  <Story name="Secondary" :args="{ label: 'Button' }" />
</template>
```

This approach is especially useful when you want to:
- Wrap stories with common layout or styling
- Share template definitions across multiple stories
- Keep story definitions clean and focused on args

#### Custom export name

Behind-the-scenes, each `<Story />` definition is compiled to a variable export like `export const MyStory = ...;`. The variable names are simplifications of the story names - to make them valid JavaScript variables.

You can explicitly define the variable name of any story by passing the `exportName` prop:

```vue
<template>
  <Story exportName="MyStory1" name="my story!" />
  <Story exportName="MyStory2" name="My Story" />
</template>
```

At least one of the `name` or `exportName` props must be passed to the `Story` component - passing both is also valid.

### TypeScript

Story template snippets can be type-safe when necessary. The type of the args are inferred from the `component` or `render` property passed to `defineMeta`.

```vue
<script setup lang="ts">
import { defineMeta } from 'addon-vue-csf';
import type { ComponentProps } from 'vue-component-type-helpers';

import MyComponent from './MyComponent.vue';

const { Story } = defineMeta({
  component: MyComponent,
});

type Args = ComponentProps<typeof MyComponent>;
</script>

<template>
  <Story name="Primary" :args="{ primary: true }" />
</template>
```

Or using Vue's `SetupContext` types:

```vue
<script setup lang="ts">
import { defineMeta } from 'addon-vue-csf';
import MyComponent from './MyComponent.vue';

const { Story } = defineMeta({
  component: MyComponent,
});
</script>

<template>
  <Story name="Primary" :args="{ primary: true }">
    <template #template="{ args }: { args: InstanceType<typeof MyComponent>['$props'] }">
      <MyComponent v-bind="args" />
    </template>
  </Story>
</template>
```

## API Reference

### `defineMeta(meta)`

Defines the metadata for a stories file.

**Parameters:**
- `meta` - Object containing Storybook meta properties:
  - `title` - The title/path for the component in Storybook
  - `component` - The component being documented
  - `subcomponents` - Record of related subcomponents
  - `decorators` - Array of decorators
  - `parameters` - Parameters object
  - `args` - Default args for all stories
  - `argTypes` - ArgTypes for controls
  - `tags` - Tags for the stories (e.g., `['autodocs']`)
  - `render` - Default render function for stories
  - `play` - Play function for all stories
  - `loaders` - Loaders for all stories
  - `globals` - Global parameters for all stories
  - `beforeEach` - Function to run before each story

**Returns:**
- Object with `Story` component that must be destructured and used in the template

### `createReusableTemplate()`

Creates a reusable template pair (DefineTemplate and ReuseTemplate). Re-exported from `@vueuse/core` for convenience.

**Returns:**
- A tuple `[DefineTemplate, ReuseTemplate]` for defining and reusing templates

### `createRenderTemplate(ReuseTemplate)`

Creates a render function for use with `defineMeta`'s render option.

**Parameters:**
- `ReuseTemplate` - The ReuseTemplate component from `createReusableTemplate()`

**Returns:**
- A render function compatible with `defineMeta`'s `render` option

### `<Story />` Props

- `name` - The name of the story (displayed in sidebar)

- `exportName` - The export name (used for the variable name in CSF)
- `args` - Args for the story (passed as props to component)
- `argTypes` - ArgTypes for this specific story
- `parameters` - Parameters for this story
- `tags` - Tags for this story
- `play` - Play function for interactions
- `loaders` - Loaders for this story
- `globals` - Global parameters for this story
- `asChild` - When true, renders children directly without wrapping in the meta component

### `<Story />` Slots

- `default` - Default slot content (becomes children of the meta component)
- `template` - Template slot that receives `{ args, context }` for custom rendering

## Version Compatibility

### latest

| Dependency | Version |
| ---------- | ------- |
| [Storybook](https://github.com/storybookjs/storybook) | `^8.2.0 \|\| ^9.0.0 \|\| ^10.0.0` |
| [Vue](https://github.com/vuejs/core) | `^3.0.0` |
| [Vite](https://github.com/vitejs/vite) | `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0` |
| [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue) | `^5.0.0` |

## 🤝 Contributing

This project uses [pnpm](https://pnpm.io/installation) for dependency management.

1. Install dependencies with `pnpm install`
2. Start the development mode with `pnpm start`
3. Make your changes and add tests
4. Run tests with `pnpm test`

## License

MIT
