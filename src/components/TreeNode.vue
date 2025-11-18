<template>
  <Accordion
    v-if="hasChildren(item.id)"
    :label="item.name"
    :open="false"
    caret-position="left"
    indicator-type="folder"
  >
    <TreeList
      :items="getChildren(item.id)"
      :parent-id="item.id"
      :forest-id="0"
      class="pl-4 md:pl-6"
    >
      <template #item="{ item: childItem }">
        <TreeNode
          :item="childItem"
          :get-children="getChildren"
          :has-children="hasChildren"
        />
      </template>
    </TreeList>
  </Accordion>
  <div v-else class="px-2 py-1 text-sm inline-flex items-center gap-2">
    <Folder v-if="item.type !== 'leaf'" :size="16" class="text-gray-500" aria-hidden="true" />
    <BookOpenCheck v-else :size="16" class="text-gray-500" aria-hidden="true" />
    <span>{{ item.name }}</span>
  </div>
</template>

<script setup lang="ts">
import Accordion from './Accordion.vue'
import TreeList from './TreeList.vue'
import { Folder, BookOpenCheck } from 'lucide-vue-next'
import type { TreeItem } from '../types'

type Props = {
  item: TreeItem
  getChildren: (parentId: number | null) => TreeItem[]
  hasChildren: (parentId: number) => boolean
}

defineProps<Props>()
</script>

