import type { Meta, StoryObj } from '@storybook/vue3'
import GeneralTreeBreadcrumb from './GeneralTreeBreadcrumb.vue'
import type { TreeItem } from '../types'

const meta = {
  title: 'UI/GeneralTreeBreadcrumb',
  component: GeneralTreeBreadcrumb,
  tags: ['autodocs'],
} satisfies Meta<typeof GeneralTreeBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

const nowIso = (): string => new Date().toISOString()

const createTreeItem = (
  id: number,
  parentId: number | null,
  position: number,
  name: string,
  type: 'tree' | 'branch' | 'leaf'
): TreeItem => ({
  id,
  forestId: 1,
  parentId,
  position,
  path: `/${parentId ? `${parentId}/` : ''}${id}/`,
  name,
  type,
  createdAt: nowIso(),
  updatedAt: nowIso(),
  deletedAt: null,
})

export const RootOnly: Story = {
  args: {} as any,
  render: () => {
    const items: TreeItem[] = []
    
    const onRootClick = () => {
      console.log('Root clicked')
    }
    
    const onBreadcrumbDrop = (payload: { newParentId: number | null; newPosition: number }) => {
      console.log('Breadcrumb drop:', payload)
    }
    
    const getChildrenCount = () => 0
    
    return {
      components: { GeneralTreeBreadcrumb },
      setup() {
        return { items, onRootClick, onBreadcrumbDrop, getChildrenCount }
      },
      template: `
        <div class="p-4">
          <GeneralTreeBreadcrumb
            :items="items"
            :on-root-click="onRootClick"
            :on-breadcrumb-drop="onBreadcrumbDrop"
            :get-children-count="getChildrenCount"
          />
        </div>
      `,
    }
  },
}

export const SingleLevel: Story = {
  args: {} as any,
  render: () => {
    const items: TreeItem[] = [
      createTreeItem(1, null, 0, 'Documents', 'branch'),
    ]
    
    const onRootClick = () => {
      console.log('Root clicked')
    }
    
    const onBreadcrumbDrop = (payload: { newParentId: number | null; newPosition: number }) => {
      console.log('Breadcrumb drop:', payload)
    }
    
    const getChildrenCount = (parentId: number) => {
      // Mock: return different counts for different parents
      return parentId === 1 ? 3 : 0
    }
    
    return {
      components: { GeneralTreeBreadcrumb },
      setup() {
        return { items, onRootClick, onBreadcrumbDrop, getChildrenCount }
      },
      template: `
        <div class="p-4">
          <GeneralTreeBreadcrumb
            :items="items"
            :on-root-click="onRootClick"
            :on-breadcrumb-drop="onBreadcrumbDrop"
            :get-children-count="getChildrenCount"
          />
        </div>
      `,
    }
  },
}

export const MultipleLevels: Story = {
  args: {} as any,
  render: () => {
    const items: TreeItem[] = [
      createTreeItem(1, null, 0, 'Root', 'tree'),
      createTreeItem(2, 1, 0, 'Documents', 'branch'),
      createTreeItem(3, 2, 0, 'Reports', 'branch'),
      createTreeItem(4, 3, 0, '2024', 'branch'),
    ]
    
    const onRootClick = () => {
      console.log('Root clicked')
    }
    
    const onBreadcrumbDrop = (payload: { newParentId: number | null; newPosition: number }) => {
      console.log('Breadcrumb drop:', payload)
    }
    
    const getChildrenCount = (parentId: number) => {
      const counts: Record<number, number> = {
        1: 2,
        2: 1,
        3: 1,
        4: 0,
      }
      return counts[parentId] ?? 0
    }
    
    return {
      components: { GeneralTreeBreadcrumb },
      setup() {
        return { items, onRootClick, onBreadcrumbDrop, getChildrenCount }
      },
      template: `
        <div class="p-4">
          <GeneralTreeBreadcrumb
            :items="items"
            :on-root-click="onRootClick"
            :on-breadcrumb-drop="onBreadcrumbDrop"
            :get-children-count="getChildrenCount"
          />
        </div>
      `,
    }
  },
}

export const CustomItemSlot: Story = {
  args: {} as any,
  render: () => {
    const items: TreeItem[] = [
      createTreeItem(1, null, 0, 'Documents', 'branch'),
      createTreeItem(2, 1, 0, 'Reports', 'branch'),
    ]
    
    const onRootClick = () => {
      console.log('Root clicked')
    }
    
    const onBreadcrumbDrop = (payload: { newParentId: number | null; newPosition: number }) => {
      console.log('Breadcrumb drop:', payload)
    }
    
    const getChildrenCount = () => 0
    
    return {
      components: { GeneralTreeBreadcrumb },
      setup() {
        return { items, onRootClick, onBreadcrumbDrop, getChildrenCount }
      },
      template: `
        <div class="p-4">
          <GeneralTreeBreadcrumb
            :items="items"
            :on-root-click="onRootClick"
            :on-breadcrumb-drop="onBreadcrumbDrop"
            :get-children-count="getChildrenCount"
          >
            <template #item="{ item }">
              <span class="font-semibold text-blue-600">{{ item.name }}</span>
            </template>
          </GeneralTreeBreadcrumb>
        </div>
      `,
    }
  },
}

