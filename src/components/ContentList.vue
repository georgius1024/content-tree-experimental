<template>
  <TreeList
    :items="items"
    :parent-id="parentId"
    :forest-id="forestId"
    :class="class"
    :handle-class="handleClass"
    @drop-node="handleDropNode"
    @click="handleClick"
    @drop-into="handleDropInto"
  >
    <template #item="{ item, index }">
      <ContentListItem
        :item="item"
        :index="index"
        :readonly="props.readonly"
        @edit="handleEdit(item)"
        @delete="handleDelete(item)"
      />
    </template>
  </TreeList>
</template>

<script setup lang="ts">
import type { TreeItem } from '../types'
import TreeList from './TreeList.vue'
import ContentListItem from './ContentListItem.vue'

type Props = {
  items: TreeItem[]
  parentId: number | null
  forestId: number
  readonly?: boolean
  class?: string
  handleClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  handleClass: '.drag-handle'
})

const emit = defineEmits<{
  (
    e: 'drop-node',
    payload: { nodeId: number; newParentId: number | null; newPosition: number }
  ): void
  (e: 'click', payload: { itemId: number }): void
  (e: 'drop-into', payload: { nodeId: number; targetParentId: number }): void
  (e: 'edit', payload: { itemId: number }): void
  (e: 'delete', payload: { itemId: number }): void
}>()

const handleDropNode = (payload: {
  nodeId: number
  newParentId: number | null
  newPosition: number
}) => {
  emit('drop-node', payload)
}

const handleClick = (payload: { itemId: number }) => {
  emit('click', payload)
}

const handleDropInto = (payload: { nodeId: number; targetParentId: number }) => {
  emit('drop-into', payload)
}

const handleEdit = (item: TreeItem) => {
  emit('edit', { itemId: item.id })
}

const handleDelete = (item: TreeItem) => {
  emit('delete', { itemId: item.id })
}
</script>

