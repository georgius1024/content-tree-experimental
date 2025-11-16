<template>
  <nav
    class="flex items-center gap-1 text-sm"
    role="navigation"
    aria-label="Breadcrumb"
  >
    <ol class="flex items-center gap-1">
      <li class="flex items-center gap-1">
        <div
          class="rounded px-1 py-0.5 hover:bg-gray-50 data-[drag-over=true]:bg-gray-100"
        >
          <button
            type="button"
            class="inline-flex items-center gap-1 align-middle rounded px-0.5 cursor-pointer hover:bg-gray-50"
            aria-label="Root"
            @click="onRootClick"
          >
            <FolderRoot :size="16" class="text-gray-500" aria-hidden="true" />
          </button>
        </div>
        <span v-if="items.length > 0" class="text-gray-400">/</span>
      </li>
      <li
        v-for="(crumb, index) in items"
        :key="crumb.id"
        class="flex items-center gap-1"
      >
        <div
          class="rounded px-1 py-0.5 hover:bg-gray-50 data-[drag-over=true]:bg-gray-100 cursor-default"
          @dragover.prevent="onCrumbDragOver(index)"
          @dragleave="onCrumbDragLeave(index)"
          @drop.prevent="onCrumbDrop(crumb)"
          :data-drag-over="dragOverIndex === index ? 'true' : 'false'"
        >
          <slot name="item" :item="crumb" :index="index">
            <span class="truncate max-w-40 inline-block align-middle">{{ crumb.name }}</span>
          </slot>
        </div>
        <span v-if="index < items.length - 1" class="text-gray-400">/</span>
      </li>
    </ol>
  </nav>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TreeItem } from '../types'
import { getForest } from '../services/tree'
import { FolderRoot } from 'lucide-vue-next'

type Props = {
  forestId: number
  path: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'breadcrumb-drop', payload: { newParentId: number | null; newPosition: number }): void
  (e: 'root-click'): void
}>()

const dragOverIndex = ref<number | null>(null)

const items = computed<TreeItem[]>(() => {
  const forest = getForest(props.forestId)
  const ids = props.path
    .split('/')
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n))
  const active = forest.filter((n) => n.deletedAt === null)
  const idToItem = new Map<number, TreeItem>(active.map((n) => [n.id, n] as const))
  return ids
    .map((id) => idToItem.get(id))
    .filter((n): n is TreeItem => Boolean(n))
})

const onCrumbDragOver = (index: number) => {
  dragOverIndex.value = index
}

const onCrumbDragLeave = (index: number) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

const onCrumbDrop = (crumb: TreeItem) => {
  const forest = getForest(props.forestId)
  const childrenCount = forest
    .filter((item) => item.deletedAt === null)
    .filter((item) => (item.parentId ?? null) === crumb.id).length
  emit('breadcrumb-drop', {
    newParentId: crumb.id,
    newPosition: childrenCount
  })
  dragOverIndex.value = null
}

const onRootClick = () => {
  emit('root-click')
}
</script>


