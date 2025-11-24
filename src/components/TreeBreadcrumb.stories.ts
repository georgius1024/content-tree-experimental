import type { Meta, StoryObj } from '@storybook/vue3'
import TreeBreadcrumb from './TreeBreadcrumb.vue'
import { CONTENT_FOREST } from '../services/samples'

const meta = {
  title: 'UI/TreeBreadcrumb',
  component: TreeBreadcrumb,
  tags: ['autodocs'],
} satisfies Meta<typeof TreeBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Root: Story = {
  args: {} as any,
  render: () => ({
    components: { TreeBreadcrumb },
    setup() {
      return { forestId: CONTENT_FOREST, path: '' }
    },
    template: `
      <div class="p-4">
        <TreeBreadcrumb :forest-id="forestId" :path="path" />
      </div>
    `,
  }),
}

export const SingleLevel: Story = {
  args: {} as any,
  render: () => ({
    components: { TreeBreadcrumb },
    setup() {
      return { forestId: CONTENT_FOREST, path: '1' }
    },
    template: `
      <div class="p-4">
        <TreeBreadcrumb :forest-id="forestId" :path="path" />
      </div>
    `,
  }),
}

export const MultipleLevels: Story = {
  args: {} as any,
  render: () => ({
    components: { TreeBreadcrumb },
    setup() {
      return { forestId: CONTENT_FOREST, path: '1/2' }
    },
    template: `
      <div class="p-4">
        <TreeBreadcrumb :forest-id="forestId" :path="path" />
      </div>
    `,
  }),
}

