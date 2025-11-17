<template>
  <Combobox
    v-model="selectedFolder"
    as="div"
    nullable
  >
    <div class="relative">
      <ComboboxInput
        :model-value="searchQuery"
        class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        :display-value="() => displayText"
        @input="handleInputChange"
        @change="handleInputChange"
      />
      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronsUpDown
          class="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </ComboboxButton>

      <ComboboxOptions
        v-if="allFilteredOptions.length > 0"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <ComboboxOption
          v-for="option in allFilteredOptions"
          :key="option.id ?? 'root'"
          v-slot="{ active, selected }"
          :value="option.folder"
          as="template"
        >
          <li
            class="relative cursor-pointer select-none px-3 py-2"
            :class="{
              'bg-blue-600 text-white': active,
              'bg-gray-100': selected && !active,
              'text-gray-900': !active
            }"
          >
            <span class="block truncate text-sm">
              <span v-html="option.highlightedText" />
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
      <div
        v-if="allFilteredOptions.length === 0 && searchQuery.trim()"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <div class="px-3 py-2 text-sm text-gray-500 text-center">
          {{ t('folderPicker.noFoldersFound') }}
        </div>
      </div>
    </div>
  </Combobox>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption
} from '@headlessui/vue'
import { ChevronsUpDown } from 'lucide-vue-next'
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

const rootText = computed(() => t('folderPicker.root'))

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const escapeRegex = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const highlightText = (text: string, query: string): string => {
  if (!query.trim()) {
    return escapeHtml(text)
  }
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return escapeHtml(text).replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}

const matchesQuery = (text: string, query: string): boolean => {
  if (!query.trim()) return true
  return text.toLowerCase().includes(query.toLowerCase())
}

const filteredFolders = computed<TreeItem[]>(() => {
  const query = searchQuery.value.trim()
  if (!query) {
    return availableFolders.value
  }
  return availableFolders.value.filter((folder) => {
    const path = folderPath(folder)
    return matchesQuery(path, query) || matchesQuery(folder.name, query)
  })
})

const shouldShowRoot = computed(() => {
  if (!props.allowRoot) return false
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return true
  // Ищем корень по слову "root" и по переводу
  const rootTextLower = rootText.value.toLowerCase()
  return matchesQuery(rootTextLower, query) || matchesQuery('root', query)
})

type FilteredOption = {
  id: string | number
  folder: TreeItem | null
  highlightedText: string
}

const allFilteredOptions = computed<FilteredOption[]>(() => {
  const options: FilteredOption[] = []
  const query = searchQuery.value.trim()

  // Добавляем корень если нужно
  if (shouldShowRoot.value) {
    options.push({
      id: 'root',
      folder: null,
      highlightedText: highlightText(rootText.value, query)
    })
  }

  // Добавляем папки
  filteredFolders.value.forEach((folder) => {
    const path = folderPath(folder)
    options.push({
      id: folder.id,
      folder,
      highlightedText: highlightText(path, query)
    })
  })

  return options
})

const selectedFolder = computed({
  get(): TreeItem | null {
    if (props.value == null) return null
    return forest.value.find((n) => n.id === props.value && n.deletedAt === null) ?? null
  },
  set(value: TreeItem | null) {
    emit('update:value', value?.id ?? null)
    // После выбора очищаем поиск и показываем выбранное значение
    searchQuery.value = ''
  }
})

const displayText = computed(() => {
  if (!selectedFolder.value) {
    return props.allowRoot ? rootText.value : t('folderPicker.selectFolderButton')
  }
  return folderPath(selectedFolder.value)
})

const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
}

watch(() => props.value, () => {
  // Когда значение меняется извне, очищаем поиск
  searchQuery.value = ''
})
</script>

<style scoped>
mark {
  padding: 0;
  background-color: #fef08a;
}
</style>
