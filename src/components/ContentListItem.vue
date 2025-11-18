<template>
  <button
    type="button"
    class="px-2 py-1 text-sm text-left w-full rounded transition hover:bg-gray-50 group"
    :class="item.type !== 'leaf' ? 'cursor-pointer' : ''"
  >
    <div class="flex items-center justify-between">
      <span class="inline-flex items-center gap-2 flex-1 min-w-0">
        <!-- Drag handle (visible on hover) -->
        <button
          v-if="!readonly"
          type="button"
          class="drag-handle shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 cursor-move"
          :title="t('common.drag')"
          @click.stop
        >
          <GripVertical :size="16" />
        </button>

        <!-- Type icon -->
        <Folder
          v-if="item.type !== 'leaf'"
          :size="16"
          class="text-gray-500 shrink-0"
          aria-hidden="true"
        />
        <BookOpenCheck v-else :size="16" class="text-gray-500 shrink-0" aria-hidden="true" />

        <!-- Item name -->
        <span class="truncate" :class="item.type !== 'leaf' ? 'group-hover:underline' : ''">{{ item.name }}</span>
      </span>

      <!-- Action buttons (visible on hover) -->
      <span
        v-if="!readonly"
        class="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <button
          type="button"
          class="rounded p-1 hover:bg-gray-100"
          :aria-label="t('common.edit')"
          @click.stop="handleEdit"
        >
          <Pencil :size="14" class="text-gray-500" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="rounded p-1 hover:bg-gray-100"
          :aria-label="t('common.delete')"
          @click.stop="handleDelete"
        >
          <Trash2 :size="14" class="text-gray-500" aria-hidden="true" />
        </button>
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Folder, BookOpenCheck, GripVertical, Pencil, Trash2 } from 'lucide-vue-next'
import type { TreeItem } from '../types'

const { t } = useI18n()

type Props = {
  item: TreeItem
  index: number
  readonly?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const handleEdit = () => {
  emit('edit')
}

const handleDelete = () => {
  emit('delete')
}
</script>

