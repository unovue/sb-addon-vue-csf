<script setup lang="ts">
import { defineMeta } from 'addon-vue-csf'
// Test @ alias resolution
import Button from '@/Button.vue'

const { Story } = defineMeta({
  title: 'Example/Button With Alias',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    backgroundColor: { control: 'color' },
  },
})
</script>

<template>
  <Story
    name="Primary"
    :args="{ primary: true, label: 'Button with @ Alias' }"
  />

  <Story
    name="Secondary"
    :args="{ label: 'Secondary with @ Alias' }"
  />

  <Story
    name="Large"
    :args="{ size: 'large', label: 'Large with @ Alias' }"
  />

  <Story
    name="Small"
    :args="{ size: 'small', label: 'Small with @ Alias' }"
  />
</template>
