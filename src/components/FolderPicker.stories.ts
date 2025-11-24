import type { Meta, StoryObj } from '@storybook/vue3'
import FolderPicker from './FolderPicker.vue'
import { CONTENT_FOREST } from '../services/tree'
import { ref } from 'vue'

const meta = {
  title: 'UI/FolderPicker',
  component: FolderPicker,
  tags: ['autodocs'],
} satisfies Meta<typeof FolderPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { FolderPicker },
    setup() {
      const selectedFolder = ref<number | null>(null)
      return { forestId: CONTENT_FOREST, currentFolderId: null, selectedFolder }
    },
    template: `
      <div class="p-4 max-w-md">
        <FolderPicker 
          :forest-id="forestId"
          :current-folder-id="currentFolderId"
          v-model="selectedFolder"
        />
        <div class="mt-4 text-sm text-gray-600">
          Selected folder ID: {{ selectedFolder }}
        </div>
      </div>
    `,
  }),
}

export const WithCurrentFolder: Story = {
  render: () => ({
    components: { FolderPicker },
    setup() {
      const selectedFolder = ref<number | null>(null)
      return { forestId: CONTENT_FOREST, currentFolderId: 1, selectedFolder }
    },
    template: `
      <div class="p-4 max-w-md">
        <FolderPicker 
          :forest-id="forestId"
          :current-folder-id="currentFolderId"
          v-model="selectedFolder"
        />
        <div class="mt-4 text-sm text-gray-600">
          Selected folder ID: {{ selectedFolder }}
        </div>
      </div>
    `,
  }),
}

export const AllowRoot: Story = {
  render: () => ({
    components: { FolderPicker },
    setup() {
      const selectedFolder = ref<number | null>(null)
      return { forestId: CONTENT_FOREST, currentFolderId: null, selectedFolder }
    },
    template: `
      <div class="p-4 max-w-md">
        <FolderPicker 
          :forest-id="forestId"
          :current-folder-id="currentFolderId"
          :allow-root="true"
          v-model="selectedFolder"
        />
        <div class="mt-4 text-sm text-gray-600">
          Selected folder ID: {{ selectedFolder }}
        </div>
      </div>
    `,
  }),
}

