<script setup lang="ts">
/**
 * Button stories using Vue CSF
 */
// eslint-disable-next-line antfu/no-import-dist
import { defineMeta } from '../dist/index'
import Button from './Button.vue'

const { Story } = defineMeta({
  title: 'Example/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    backgroundColor: { control: 'color' },
  },
})
</script>

<template>
  <!-- Primary story -->
  <Story
    name="Primary"
    :args="{
      primary: true,
      label: 'Button',
    }"
  />

  <!-- Secondary story -->
  <Story
    name="Secondary"
    :args="{
      label: 'Button',
    }"
  />

  <!-- Large story -->
  <Story
    name="Large"
    :args="{
      size: 'large',
      label: 'Button',
    }"
  />

  <!-- Small story -->
  <Story
    name="Small"
    :args="{
      size: 'small',
      label: 'Button',
    }"
  />

  <!-- With custom template -->
  <Story name="WithCustomTemplate" :args="{ label: 'Custom Template' }">
    <template #template="{ args }">
      <div style="padding: 20px; background: #f0f0f0;">
        <Button v-bind="args" />
      </div>
    </template>
  </Story>

  <!-- With asChild: renders children directly without wrapping in component -->
  <Story name="WithAsChild" :args="{ label: 'As Child Button' }" as-child>
    <Button :primary="true" label="Custom Rendered Button" />
  </Story>
</template>
