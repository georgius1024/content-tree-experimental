<template>
  <ul
    class="flex flex-col gap-1"
    role="list"
    @dragover.prevent="onListDragOver"
    @drop.prevent="onListDrop"
  >
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="rounded hover:bg-gray-50 data-[drag-over=true]:bg-gray-100"
      draggable="true"
      @dragstart="onItemDragStart(item.id)"
      @dragend="onItemDragEnd"
      @dragover.prevent="onItemDragOver(index)"
      @dragleave="onItemDragLeave(index)"
      @drop.prevent="onItemDrop(index)"
      :data-drag-over="dragOverIndex === index ? 'true' : 'false'"
    >
      <slot name="item" :item="item" :index="index">
        <div class="px-2 py-1 text-sm">{{ item.name }}</div>
      </slot>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { TreeItem } from '../types'

type Props = {
  items: TreeItem[]
  parentId: number | null
  forestId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'drag-start', payload: { nodeId: number }): void
  (e: 'drag-end', payload: { nodeId: number | null }): void
  (e: 'drop-node', payload: { nodeId: number; newParentId: number | null; newPosition: number }): void
}>()

const draggingNodeId = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const onItemDragStart = (nodeId: number) => {
  draggingNodeId.value = nodeId
  emit('drag-start', { nodeId })
}

const onItemDragEnd = () => {
  emit('drag-end', { nodeId: draggingNodeId.value })
  draggingNodeId.value = null
  dragOverIndex.value = null
}

const onItemDragOver = (index: number) => {
  dragOverIndex.value = index
}

const onItemDragLeave = (index: number) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

const onItemDrop = (index: number) => {
  if (draggingNodeId.value == null) return
  emit('drop-node', {
    nodeId: draggingNodeId.value,
    newParentId: props.parentId,
    newPosition: index
  })
  dragOverIndex.value = null
}

const onListDragOver = () => {
  // Allow dropping at the end of the list
  dragOverIndex.value = null
}

const onListDrop = () => {
  if (draggingNodeId.value == null) return
  emit('drop-node', {
    nodeId: draggingNodeId.value,
    newParentId: props.parentId,
    newPosition: props.items.length
  })
}
</script>

