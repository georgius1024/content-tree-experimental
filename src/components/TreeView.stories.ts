import type { Meta, StoryObj } from '@storybook/vue3'
import TreeView from './TreeView.vue'
import { CONTENT_FOREST } from '../../services/samples'

const meta = {
  title: 'UI/TreeView',
  component: TreeView,
  tags: ['autodocs'],
} satisfies Meta<typeof TreeView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { TreeView },
    setup() {
      return { forestId: CONTENT_FOREST }
    },
    template: `
      <div class="max-w-md">
        <TreeView :forest-id="forestId" />
      </div>
    `,
  }),
}

export const WithoutForestId: Story = {
  render: () => ({
    components: { TreeView },
    template: `
      <div class="max-w-md">
        <TreeView />
      </div>
    `,
  }),
}

