import type { Meta, StoryObj } from '@storybook/vue3'
import TreeList from './TreeList.vue'
import type { TreeItem } from '../../types'

const meta = {
  title: 'UI/TreeList',
  component: TreeList,
  tags: ['autodocs'],
} satisfies Meta<typeof TreeList>

export default meta
type Story = StoryObj<typeof meta>

const nowIso = (): string => new Date().toISOString()

const createTreeItem = (
  id: number,
  forestId: number,
  parentId: number | null,
  position: number,
  name: string,
  type: 'tree' | 'branch' | 'leaf',
  path?: string
): TreeItem => ({
  id,
  forestId,
  parentId,
  position,
  path: path ?? `/${parentId ? `${parentId}/` : ''}${id}/`,
  name,
  type,
  createdAt: nowIso(),
  updatedAt: nowIso(),
  deletedAt: null,
})

export const Default: Story = {
  render: () => {
    const forestId = 1
    const items: TreeItem[] = [
      createTreeItem(1, forestId, null, 0, 'Folder 1', 'branch'),
      createTreeItem(2, forestId, null, 1, 'Folder 2', 'branch'),
      createTreeItem(3, forestId, null, 2, 'Course 1', 'leaf'),
    ]
    
    return {
      components: { TreeList },
      setup() {
        return { items, parentId: null, forestId }
      },
      template: `
        <div class="p-4 max-w-md">
          <TreeList 
            :items="items" 
            :parent-id="parentId" 
            :forest-id="forestId"
          />
        </div>
      `,
    }
  },
}

export const WithNestedItems: Story = {
  render: () => {
    const forestId = 1
    const items: TreeItem[] = [
      createTreeItem(1, forestId, null, 0, 'Root Folder', 'branch'),
      createTreeItem(2, forestId, null, 1, 'Another Folder', 'branch'),
      createTreeItem(3, forestId, null, 2, 'Course A', 'leaf'),
      createTreeItem(4, forestId, null, 3, 'Course B', 'leaf'),
    ]
    
    return {
      components: { TreeList },
      setup() {
        return { items, parentId: null, forestId }
      },
      template: `
        <div class="p-4 max-w-md">
          <TreeList 
            :items="items" 
            :parent-id="parentId" 
            :forest-id="forestId"
          />
        </div>
      `,
    }
  },
}

export const CustomItemSlot: Story = {
  render: () => {
    const forestId = 1
    const items: TreeItem[] = [
      createTreeItem(1, forestId, null, 0, 'Custom Item 1', 'branch'),
      createTreeItem(2, forestId, null, 1, 'Custom Item 2', 'leaf'),
    ]
    
    return {
      components: { TreeList },
      setup() {
        return { items, parentId: null, forestId }
      },
      template: `
        <div class="p-4 max-w-md">
          <TreeList 
            :items="items" 
            :parent-id="parentId" 
            :forest-id="forestId"
          >
            <template #item="{ item }">
              <div class="px-2 py-1 text-sm bg-blue-50 rounded">
                <strong>{{ item.name }}</strong> ({{ item.type }})
              </div>
            </template>
          </TreeList>
        </div>
      `,
    }
  },
}

