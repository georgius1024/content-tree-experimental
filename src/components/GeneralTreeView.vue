<template>
  <div class="p-4">
    <div v-if="root">
      <Accordion :label="root.name" :open="true" caret-position="left" indicator-type="folder">
        <TreeList
          :items="getChildren(root.id)"
          :parent-id="root.id"
          :forest-id="0"
          class="pl-2 md:pl-4"
        >
          <template #item="{ item }">
            <TreeNode
              :item="item"
              :get-children="getChildren"
              :has-children="hasChildren"
            />
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
import TreeNode from './TreeNode.vue'
import type { TreeItem } from '../types'

type Props = {
  root: TreeItem | null
  getChildren: (parentId: number | null) => TreeItem[]
  hasChildren: (parentId: number) => boolean
}

defineProps<Props>()
</script>

