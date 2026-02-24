<script setup lang="ts">
import { computed } from 'vue'

/**
 * Button component for examples
 */
interface Props {
  /**
   * The label text displayed on the button
   */
  label: string
  /**
   * Whether the button should use the primary style (blue background)
   * @default false
   */
  primary?: boolean
  /**
   * The size of the button
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * Custom background color for the button
   */
  backgroundColor?: string
  /**
   * Whether the button is disabled
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  primary: false,
  size: 'medium',
})

const emit = defineEmits<{
  /**
   * Emitted when the button is clicked
   * @param event - The mouse event from the click
   */
  click: [event: MouseEvent]
}>()

const classes = computed(() => {
  return {
    'storybook-button': true,
    'storybook-button--primary': props.primary,
    'storybook-button--secondary': !props.primary,
    [`storybook-button--${props.size}`]: true,
  }
})

const style = {
  backgroundColor: props.backgroundColor,
}

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <button
    type="button"
    :class="classes"
    :style="style"
    :disabled="disabled"
    @click="onClick"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.storybook-button {
  font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 700;
  border: 0;
  border-radius: 3em;
  cursor: pointer;
  display: inline-block;
  line-height: 1;
}

.storybook-button--primary {
  color: white;
  background-color: #1ea7fd;
}

.storybook-button--secondary {
  color: #333;
  background-color: transparent;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset;
}

.storybook-button--small {
  font-size: 12px;
  padding: 10px 16px;
}

.storybook-button--medium {
  font-size: 14px;
  padding: 11px 20px;
}

.storybook-button--large {
  font-size: 16px;
  padding: 12px 24px;
}
</style>
