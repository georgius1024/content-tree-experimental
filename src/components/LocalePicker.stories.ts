import type { Meta, StoryObj } from '@storybook/vue3'
import LocalePicker from './LocalePicker.vue'

const meta = {
  title: 'UI/LocalePicker',
  component: LocalePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof LocalePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { LocalePicker },
    template: `
      <div class="p-4">
        <LocalePicker />
      </div>
    `,
  }),
}

