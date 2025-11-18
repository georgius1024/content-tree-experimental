<template>
  <Combobox
    v-model="selectedFolder"
    as="div"
    nullable
  >
    <div class="relative">
      <ComboboxInput
        ref="inputRef"
        :model-value="displayText"
        readonly
        class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        :display-value="() => displayText"
        @click="handleInputClick"
      />
      <ComboboxButton ref="buttonRef" class="absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronsUpDown
          class="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </ComboboxButton>

      <ComboboxOptions
        v-if="allFilteredOptions.length > 0"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <div class="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 z-10" @click.stop @mousedown.stop style="pointer-events: auto;">
          <div class="relative">
            <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="search"
              :disabled="false"
              class="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search folders..."
              @click.stop
              @mousedown.stop
              style="pointer-events: auto;"
            />
          </div>
        </div>
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
        v-if="allFilteredOptions.length === 0"
        class="absolute z-10 mt-1 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <div class="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 z-10" @click.stop @mousedown.stop style="pointer-events: auto;">
          <div class="relative">
            <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="search"
              :disabled="false"
              class="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search folders..."
              @click.stop
              @mousedown.stop
              style="pointer-events: auto;"
            />
          </div>
        </div>
        <div class="px-3 py-2 text-sm text-gray-500 text-center">
          {{ noFoldersFoundText }}
        </div>
      </div>
    </div>
  </Combobox>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption
} from '@headlessui/vue'
import { ChevronsUpDown, Search } from 'lucide-vue-next'
import type { TreeItem } from '../types'

type Props = {
  folders: TreeItem[]
  selectedFolderId: number | null
  getFolderPath: (folder: TreeItem) => string
  onSelect: (folderId: number | null) => void
  allowRoot?: boolean
  rootText?: string
  selectFolderButtonText?: string
  noFoldersFoundText?: string
}

const props = withDefaults(defineProps<Props>(), {
  allowRoot: true,
  rootText: 'Root',
  selectFolderButtonText: 'Select folder',
  noFoldersFoundText: 'No folders found',
})

const searchQuery = ref('')
const buttonRef = ref<InstanceType<typeof ComboboxButton> | null>(null)
const inputRef = ref<InstanceType<typeof ComboboxInput> | null>(null)

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
    return props.folders
  }
  return props.folders.filter((folder) => {
    const path = props.getFolderPath(folder)
    return matchesQuery(path, query) || matchesQuery(folder.name, query)
  })
})

const shouldShowRoot = computed(() => {
  if (!props.allowRoot) return false
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return true
  const rootTextLower = props.rootText.toLowerCase()
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

  if (shouldShowRoot.value) {
    options.push({
      id: 'root',
      folder: null,
      highlightedText: highlightText(props.rootText, query)
    })
  }

  filteredFolders.value.forEach((folder) => {
    const path = props.getFolderPath(folder)
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
    if (props.selectedFolderId == null) return null
    return props.folders.find((n) => n.id === props.selectedFolderId) ?? null
  },
  set(value: TreeItem | null) {
    props.onSelect(value?.id ?? null)
    searchQuery.value = ''
  }
})

const displayText = computed(() => {
  if (!selectedFolder.value) {
    return props.allowRoot ? props.rootText : props.selectFolderButtonText
  }
  return props.getFolderPath(selectedFolder.value)
})

const handleInputClick = async () => {
  // Open the combobox when clicking on the input by triggering the button click
  await nextTick()
  
  // Find the button element - try multiple approaches
  const inputElement = inputRef.value?.$el as HTMLElement | undefined
  if (inputElement) {
    const parent = inputElement.parentElement
    const button = parent?.querySelector('button[data-headlessui-state]') || parent?.querySelector('button')
    if (button) {
      (button as HTMLElement).click()
    }
  }
}

watch(() => props.selectedFolderId, () => {
  searchQuery.value = ''
})
</script>

<style scoped>
mark {
  padding: 0;
  background-color: #fef08a;
}
</style>

