<template>
  <div class="relative">
    <button
      type="button"
      class="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      @click="showModal = true"
    >
      <span class="truncate text-sm">
        {{ displayText }}
      </span>
      <span class="ml-2 text-gray-400">⋯</span>
    </button>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-200 bg-opacity-50"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ t('folderPicker.selectFolder') }}</h2>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click="showModal = false"
          >
            ✕
          </button>
        </div>

        <!-- Search -->
        <div class="p-4 border-b border-gray-200">
          <input
            v-model="searchQuery"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder="t('folderPicker.searchPlaceholder')"
            @keyup.esc="showModal = false"
          />
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto p-2">
          <ul class="space-y-1">
            <li
              v-if="showRootOption"
              class="px-3 py-2 rounded hover:bg-gray-50 cursor-pointer text-sm font-medium"
              :class="{ 'bg-blue-50': props.value === null }"
              @click="selectRoot"
            >
              {{ t('folderPicker.root') }}
            </li>
            <li v-if="filteredFolders.length === 0 && !showRootOption" class="px-3 py-2 text-sm text-gray-500 text-center">
              {{ t('folderPicker.noFoldersFound') }}
            </li>
            <li
              v-for="folder in filteredFolders"
              :key="folder.id"
              class="px-3 py-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
              :class="{ 'bg-blue-50': props.value === folder.id }"
              @click="selectFolder(folder)"
            >
              <div v-html="highlightedPath(folder)" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TreeItem } from '../types'
import { getForest, sortTreeItems } from '../services/tree'

const { t } = useI18n()

type Props = {
  forestId: number
  currentFolderId: number | null
  value: number | null
  excludeDescendantsOf?: number | null
  allowRoot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  excludeDescendantsOf: null,
  allowRoot: true
})

const emit = defineEmits<{
  (e: 'update:value', value: number | null): void
}>()

const showModal = ref(false)
const searchQuery = ref('')

const forest = computed<TreeItem[]>(() => getForest(props.forestId))

const availableFolders = computed<TreeItem[]>(() => {
  const excludeId = props.excludeDescendantsOf
  return forest.value
    .filter((n) => n.deletedAt === null && n.type !== 'leaf')
    .filter((n) => {
      if (!excludeId || !n.path) return true
      const excludeNode = forest.value.find((item) => item.id === excludeId)
      if (!excludeNode) return true
      return !n.path.startsWith(excludeNode.path)
    })
    .sort(sortTreeItems)
})

const folderPath = (folder: TreeItem): string => {
  const ids = folder.path.split('/').filter(Boolean).map((s) => Number(s)).filter((n) => Number.isFinite(n))
  const pathItems: string[] = []
  ids.forEach((id) => {
    const item = forest.value.find((n) => n.id === id && n.deletedAt === null)
    if (item) {
      pathItems.push(item.name)
    }
  })
  return pathItems.length > 0 ? pathItems.join(' / ') : folder.name
}

const filteredFolders = computed<TreeItem[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return availableFolders.value
  }
  return availableFolders.value.filter((folder) => {
    const path = folderPath(folder).toLowerCase()
    return path.includes(query)
  })
})

const showRootOption = computed(() => {
  if (!props.allowRoot) return false
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return true
  return 'root'.includes(query)
})

const highlightedPath = (folder: TreeItem): string => {
  const path = folderPath(folder)
  const query = searchQuery.value.trim()
  if (!query) {
    return escapeHtml(path)
  }
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return escapeHtml(path).replace(regex, '<mark class="bg-gray-200">$1</mark>')
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const escapeRegex = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const selectedFolder = computed(() => {
  if (props.value == null) return null
  return forest.value.find((n) => n.id === props.value && n.deletedAt === null) ?? null
})

const displayText = computed(() => {
  if (!selectedFolder.value) {
    return props.allowRoot ? t('folderPicker.root') : t('folderPicker.selectFolderButton')
  }
  return folderPath(selectedFolder.value)
})

const selectFolder = (folder: TreeItem) => {
  emit('update:value', folder.id)
  showModal.value = false
  searchQuery.value = ''
}

const selectRoot = () => {
  emit('update:value', null)
  showModal.value = false
  searchQuery.value = ''
}

watch(() => props.value, () => {
  if (props.value == null && showModal.value) {
    emit('update:value', null)
  }
})
</script>

<style scoped>
mark {
  padding: 0;
  background-color: #fef08a;
}
</style>

