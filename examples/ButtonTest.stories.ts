import type { Meta, StoryObj } from '@storybook/vue3'
import Button from './Button.vue'

/**
 * Button component stories - Regular CSF format for testing autodocs
 */
const meta = {
  title: 'Example/ButtonTest',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Primary button with main action style
 */
export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
}

/**
 * Secondary button with subtle style
 */
export const Secondary: Story = {
  args: {
    label: 'Button',
  },
}

/**
 * Large sized button
 */
export const Large: Story = {
  args: {
    size: 'large',
    label: 'Button',
  },
}

/**
 * Small sized button
 */
export const Small: Story = {
  args: {
    size: 'small',
    label: 'Button',
  },
}
