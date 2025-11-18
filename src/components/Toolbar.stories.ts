import type { Meta, StoryObj } from '@storybook/vue3'
import Toolbar from './Toolbar.vue'

const meta = {
  title: 'UI/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Toolbar Title',
  },
  render: (args) => ({
    components: { Toolbar },
    setup() {
      return { args }
    },
    template: `
      <Toolbar v-bind="args" />
    `,
  }),
}

export const WithActions: Story = {
  args: {
    title: 'Toolbar with Actions',
  },
  render: (args) => ({
    components: { Toolbar },
    setup() {
      return { args }
    },
    template: `
      <Toolbar v-bind="args">
        <template #end>
          <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm">Save</button>
          <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Cancel</button>
        </template>
      </Toolbar>
    `,
  }),
}

export const CustomSlots: Story = {
  render: () => ({
    components: { Toolbar },
    template: `
      <Toolbar>
        <template #start>
          <h2 class="text-lg font-bold">Custom Header</h2>
        </template>
        <template #end>
          <button class="px-4 py-2 bg-green-500 text-white rounded">Action 1</button>
          <button class="px-4 py-2 bg-red-500 text-white rounded">Action 2</button>
        </template>
      </Toolbar>
    `,
  }),
}

export const NoTitle: Story = {
  render: () => ({
    components: { Toolbar },
    template: `
      <Toolbar>
        <template #end>
          <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm">Save</button>
        </template>
      </Toolbar>
    `,
  }),
}

