<script lang="ts">
/**
 * Module scope script - defines reusable templates at module level
 * This makes them accessible to CSF exports and the render function
 */

import { createRenderTemplate, createReusableTemplate, defineMeta } from 'addon-vue-csf'
import { ref } from 'vue'
import Button from './Button.vue'

// Create reusable template at MODULE scope
export const [DefineWrapperTemplate, ReuseWrapperTemplate] = createReusableTemplate()

// Create the default render function using the helper
export const defaultTemplate = createRenderTemplate(ReuseWrapperTemplate)
</script>

<script setup lang="ts">
const { Story } = defineMeta({
  title: 'Example/ButtonWithRender',
  component: Button,
  tags: ['autodocs'],
  // Use the render function from createRenderTemplate
  render: defaultTemplate,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    backgroundColor: { control: 'color' },
  },
})

const count = ref(0)
</script>

<template>
  <!-- Define the reusable template content -->
  <DefineWrapperTemplate v-slot="{ args }">
    <div style="padding: 20px; border: 2px dashed #1ea7fd; border-radius: 8px; background: #f0f9ff;">
      <p style="margin: 0 0 10px; color: #1ea7fd; font-weight: bold;">
        Reusable Template Wrapper (VueUse + createRenderTemplate) {{ count }}
      </p>
      <Button v-bind="args" @click="count++" />
    </div>
  </DefineWrapperTemplate>

  <!-- Stories using the default template from defineMeta -->
  <Story
    name="Primary"
    :args="{
      primary: true,
      label: 'Button',
    }"
  />

  <Story
    name="Secondary"
    :args="{
      label: 'Button',
    }"
  />

  <Story
    name="Large"
    :args="{
      size: 'large',
      label: 'Large Button',
      backgroundColor: '#ff6b6b',
    }"
  />

  <!-- Story with custom template -->
  <Story
    name="CustomTemplate"
    :args="{
      primary: true,
      label: 'Different Wrapper',
    }"
  >
    <template #template="{ args }">
      <div style="padding: 30px; border: 3px solid #ff6b6b; border-radius: 12px; background: #fff0f0;">
        <p style="margin: 0 0 15px; color: #ff6b6b; font-weight: bold;">
          Custom One-off Template
        </p>
        <Button v-bind="args" />
      </div>
    </template>
  </Story>
</template>
