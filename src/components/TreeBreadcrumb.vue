<template>
  <GeneralTreeBreadcrumb
    :items="items"
    :on-root-click="handleRootClick"
    :on-breadcrumb-drop="handleBreadcrumbDrop"
    :get-children-count="getChildrenCount"
  >
    <template #item="{ item, index }">
      <slot name="item" :item="item" :index="index" />
    </template>
  </GeneralTreeBreadcrumb>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import GeneralTreeBreadcrumb from './GeneralTreeBreadcrumb.vue'
import type { TreeItem } from '../types'
import { getForest } from '../services/tree'

type Props = {
  forestId: number
  path: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'breadcrumb-drop', payload: { newParentId: number | null; newPosition: number }): void
  (e: 'root-click'): void
}>()

const forest = ref<TreeItem[]>([])

const loadForest = async () => {
  forest.value = await getForest(props.forestId)
}

onMounted(() => {
  loadForest()
})

watch(() => [props.forestId, props.path], () => {
  loadForest()
})

const items = computed<TreeItem[]>(() => {
  const ids = props.path
    .split('/')
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n))
  const active = forest.value.filter((n) => n.deletedAt === null)
  const idToItem = new Map<number, TreeItem>(active.map((n) => [n.id, n] as const))
  return ids
    .map((id) => idToItem.get(id))
    .filter((n): n is TreeItem => Boolean(n))
})

const getChildrenCount = (parentId: number): number => {
  return forest.value
    .filter((item) => item.deletedAt === null)
    .filter((item) => (item.parentId ?? null) === parentId).length
}

const handleRootClick = () => {
  emit('root-click')
}

const handleBreadcrumbDrop = (payload: { newParentId: number | null; newPosition: number }) => {
  emit('breadcrumb-drop', payload)
}
</script>


