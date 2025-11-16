<template>
  <div class="p-4">
    <div v-if="root">
      <Accordion :label="root.name" :open="true">
        <TreeList
          :items="childrenOf(root.id)"
          :parent-id="root.id"
          :forest-id="resolvedForestId"
        >
          <template #item="{ item }">
            <Accordion v-if="hasChildren(item.id)" :label="item.name" :open="false">
              <TreeList
                :items="childrenOf(item.id)"
                :parent-id="item.id"
                :forest-id="resolvedForestId"
              />
            </Accordion>
            <div v-else class="px-2 py-1 text-sm">
              {{ item.name }}
            </div>
          </template>
        </TreeList>
      </Accordion>
    </div>
    <div v-else class="text-sm text-gray-500">No tree found.</div>
  </div>
</template>
<script setup lang="ts">
import Accordion from './Accordion.vue'
import TreeList from './TreeList.vue'
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


