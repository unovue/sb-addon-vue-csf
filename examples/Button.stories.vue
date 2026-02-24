<script setup lang="ts">
/**
 * Button stories using Vue CSF
 */

import { defineMeta } from 'sb-addon-vue-csf'
import { expect, within } from 'storybook/test'
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

// Play function for testing button renders correctly
async function playRendersTest({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement)
  const button = canvas.getByRole('button')

  expect(button).toBeInTheDocument()
}
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

  <!-- With play function: tests button renders correctly -->
  <Story
    name="WithPlayTest"
    :args="{ primary: true, label: 'Play Test Button' }"
    :play="playRendersTest"
  />
</template>
