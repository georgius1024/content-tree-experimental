import type { Meta, StoryObj } from '@storybook/vue3'
import GeneralFolderPicker from './GeneralFolderPicker.vue'
import { ref } from 'vue'
import type { TreeItem } from '../../types'

const meta = {
  title: 'UI/GeneralFolderPicker',
  component: GeneralFolderPicker,
  tags: ['autodocs'],
} satisfies Meta<typeof GeneralFolderPicker>

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

export const Default: Story = {
  render: () => {
    const folders: TreeItem[] = [
      createTreeItem(1, null, 0, 'Root', 'tree'),
      createTreeItem(2, 1, 0, 'Documents', 'branch'),
      createTreeItem(3, 1, 1, 'Projects', 'branch'),
      createTreeItem(4, 2, 0, 'Reports', 'branch'),
      createTreeItem(5, 3, 0, 'Web', 'branch'),
    ]
    
    const selectedFolderId = ref<number | null>(null)
    
    const getFolderPath = (folder: TreeItem): string => {
      const pathMap = new Map<number, TreeItem>(folders.map((f) => [f.id, f]))
      const parts: string[] = []
      let current: TreeItem | undefined = folder
      
      while (current) {
        parts.unshift(current.name)
        if (current.parentId) {
          current = pathMap.get(current.parentId)
        } else {
          break
        }
      }
      
      return parts.join(' / ')
    }
    
    const onSelect = (folderId: number | null) => {
      selectedFolderId.value = folderId
    }
    
    return {
      components: { GeneralFolderPicker },
      setup() {
        return { folders, selectedFolderId, getFolderPath, onSelect }
      },
      template: `
        <div class="p-4 max-w-md">
          <GeneralFolderPicker
            :folders="folders"
            :selected-folder-id="selectedFolderId"
            :get-folder-path="getFolderPath"
            :on-select="onSelect"
          />
          <div class="mt-4 text-sm text-gray-600">
            Selected: {{ selectedFolderId }}
          </div>
        </div>
      `,
    }
  },
}

export const WithSelectedFolder: Story = {
  render: () => {
    const folders: TreeItem[] = [
      createTreeItem(1, null, 0, 'Root', 'tree'),
      createTreeItem(2, 1, 0, 'Documents', 'branch'),
      createTreeItem(3, 1, 1, 'Projects', 'branch'),
    ]
    
    const selectedFolderId = ref<number | null>(2)
    
    const getFolderPath = (folder: TreeItem): string => {
      if (folder.parentId === null) return folder.name
      const parent = folders.find((f) => f.id === folder.parentId)
      return parent ? `${parent.name} / ${folder.name}` : folder.name
    }
    
    const onSelect = (folderId: number | null) => {
      selectedFolderId.value = folderId
    }
    
    return {
      components: { GeneralFolderPicker },
      setup() {
        return { folders, selectedFolderId, getFolderPath, onSelect }
      },
      template: `
        <div class="p-4 max-w-md">
          <GeneralFolderPicker
            :folders="folders"
            :selected-folder-id="selectedFolderId"
            :get-folder-path="getFolderPath"
            :on-select="onSelect"
          />
        </div>
      `,
    }
  },
}

export const WithoutRoot: Story = {
  render: () => {
    const folders: TreeItem[] = [
      createTreeItem(2, 1, 0, 'Documents', 'branch'),
      createTreeItem(3, 1, 1, 'Projects', 'branch'),
    ]
    
    const selectedFolderId = ref<number | null>(null)
    
    const getFolderPath = (folder: TreeItem): string => folder.name
    
    const onSelect = (folderId: number | null) => {
      selectedFolderId.value = folderId
    }
    
    return {
      components: { GeneralFolderPicker },
      setup() {
        return { folders, selectedFolderId, getFolderPath, onSelect, allowRoot: false }
      },
      template: `
        <div class="p-4 max-w-md">
          <GeneralFolderPicker
            :folders="folders"
            :selected-folder-id="selectedFolderId"
            :get-folder-path="getFolderPath"
            :on-select="onSelect"
            :allow-root="allowRoot"
          />
        </div>
      `,
    }
  },
}

export const CustomTexts: Story = {
  render: () => {
    const folders: TreeItem[] = [
      createTreeItem(1, null, 0, 'Root', 'tree'),
      createTreeItem(2, 1, 0, 'Folder A', 'branch'),
    ]
    
    const selectedFolderId = ref<number | null>(null)
    
    const getFolderPath = (folder: TreeItem): string => folder.name
    
    const onSelect = (folderId: number | null) => {
      selectedFolderId.value = folderId
    }
    
    return {
      components: { GeneralFolderPicker },
      setup() {
        return {
          folders,
          selectedFolderId,
          getFolderPath,
          onSelect,
          rootText: 'Корень',
          selectFolderButtonText: 'Выберите папку',
          noFoldersFoundText: 'Папки не найдены',
        }
      },
      template: `
        <div class="p-4 max-w-md">
          <GeneralFolderPicker
            :folders="folders"
            :selected-folder-id="selectedFolderId"
            :get-folder-path="getFolderPath"
            :on-select="onSelect"
            root-text="Корень"
            select-folder-button-text="Выберите папку"
            no-folders-found-text="Папки не найдены"
          />
        </div>
      `,
    }
  },
}

export const EmptyFolders: Story = {
  render: () => {
    const folders: TreeItem[] = []
    const selectedFolderId = ref<number | null>(null)
    
    const getFolderPath = (folder: TreeItem): string => folder.name
    
    const onSelect = (folderId: number | null) => {
      selectedFolderId.value = folderId
    }
    
    return {
      components: { GeneralFolderPicker },
      setup() {
        return { folders, selectedFolderId, getFolderPath, onSelect }
      },
      template: `
        <div class="p-4 max-w-md">
          <GeneralFolderPicker
            :folders="folders"
            :selected-folder-id="selectedFolderId"
            :get-folder-path="getFolderPath"
            :on-select="onSelect"
          />
        </div>
      `,
    }
  },
}

