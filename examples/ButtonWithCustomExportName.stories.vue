<script setup lang="ts">
/**
 * Button stories demonstrating custom export name feature
 *
 * The exportName prop allows you to define a custom variable name for the story export.
 * This is useful when:
 * - You want a different export name than the auto-generated one from the story name
 * - Your story name contains special characters that aren't valid in JavaScript identifiers
 * - You want a shorter export name for a long story name
 */
// eslint-disable-next-line antfu/no-import-dist
import { defineMeta } from '../dist/index'
import Button from './Button.vue'

const { Story } = defineMeta({
  title: 'Example/ButtonWithCustomExportName',
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
  <!--
    Using only exportName (without name prop).
    The story will use the exportName as the display name in the sidebar.
  -->
  <Story
    export-name="CustomExport"
    :args="{
      primary: true,
      label: 'Custom Export Name Only',
    }"
  />

  <!--
    Using both name and exportName.
    The 'name' is displayed in the sidebar,
    while 'exportName' is used for the variable export.
  -->
  <Story
    export-name="MySpecialStory"
    name="My Special Story!"
    :args="{
      label: 'Name with Special Chars',
    }"
  />

  <!--
    Another example with both props showing different naming conventions.
    This allows you to have a descriptive display name but a concise export name.
  -->
  <Story
    export-name="PrimaryBtn"
    name="Primary Button with Very Long Descriptive Name"
    :args="{
      primary: true,
      label: 'Long Name, Short Export',
    }"
  />

  <!--
    Story name with characters that would be invalid or ugly in a JS identifier.
    Without exportName, this would generate something like 'MyStory123'.
    With exportName, we have full control over the export variable name.
  -->
  <Story
    export-name="StoryWithNumbers123"
    name="123 - Numbered Story"
    :args="{
      label: 'Numbered Story',
    }"
  />
</template>
