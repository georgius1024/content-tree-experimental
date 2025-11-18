import type { Meta, StoryObj } from '@storybook/vue3'
import Collapsible from './Collapsible.vue'
import { ref } from 'vue'

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'boolean' },
    duration: { control: 'number' },
    transition: {
      control: 'select',
      options: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'],
    },
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: false,
    duration: 200,
    transition: 'linear',
  },
  render: (args) => ({
    components: { Collapsible },
    setup() {
      const isCollapsed = ref(args.value)
      return { args, isCollapsed }
    },
    template: `
      <div>
        <button 
          @click="isCollapsed = !isCollapsed"
          class="mb-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Toggle
        </button>
        <Collapsible :value="isCollapsed" :duration="args.duration" :transition="args.transition">
          <div class="p-4 bg-gray-100 border border-gray-300 rounded">
            <p>This is collapsible content. Click the button above to toggle.</p>
          </div>
        </Collapsible>
      </div>
    `,
  }),
}

export const Open: Story = {
  args: {
    value: true,
    duration: 200,
    transition: 'linear',
  },
  render: (args) => ({
    components: { Collapsible },
    setup() {
      return { args }
    },
    template: `
      <Collapsible :value="args.value" :duration="args.duration" :transition="args.transition">
        <div class="p-4 bg-gray-100 border border-gray-300 rounded">
          <p>This collapsible is open by default.</p>
        </div>
      </Collapsible>
    `,
  }),
}

export const SlowTransition: Story = {
  args: {
    value: false,
    duration: 500,
    transition: 'ease-in-out',
  },
  render: (args) => ({
    components: { Collapsible },
    setup() {
      const isCollapsed = ref(args.value)
      return { args, isCollapsed }
    },
    template: `
      <div>
        <button 
          @click="isCollapsed = !isCollapsed"
          class="mb-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Toggle (Slow)
        </button>
        <Collapsible :value="isCollapsed" :duration="args.duration" :transition="args.transition">
          <div class="p-4 bg-gray-100 border border-gray-300 rounded">
            <p>This collapsible has a slower transition (500ms).</p>
          </div>
        </Collapsible>
      </div>
    `,
  }),
}

