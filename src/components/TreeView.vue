<template>
  <GeneralTreeView
    :root="root"
    :get-children="childrenOf"
    :has-children="hasChildren"
  />
</template>

<script setup lang="ts">
import GeneralTreeView from './GeneralTreeView.vue'
import * as treeService from '../services/tree'
import { ref, computed, onMounted } from 'vue'
import type { TreeItem } from '../types'

type Props = {
  forestId?: number
}

const props = defineProps<Props>()
const resolvedForestId = computed(() => props.forestId ?? treeService.CONTENT_FOREST)

const tree = ref<TreeItem[]>([])

const isActive = (item: TreeItem) => item.deletedAt === null
const byPosition = (a: TreeItem, b: TreeItem) => (a.position - b.position) || (a.id - b.id)

const root = computed(() => {
  return tree.value.find((item) => item.parentId == null && item.type === 'tree' && isActive(item)) ?? null
})

const childrenOf = (parentId: number | null) => {
  return tree.value
    .filter(isActive)
    .filter((item) => (item.parentId ?? null) === (parentId ?? null))
    .sort(byPosition)
}

const hasChildren = (parentId: number) => {
  return tree.value.some((item) => isActive(item) && item.parentId === parentId)
}

onMounted(() => {
  tree.value = treeService.getForest(resolvedForestId.value)
})
</script>


