<template>
  <div class="mx-auto max-w-2xl">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <TreeBreadcrumb
          :forest-id="forestId"
          :path="path"
          @root-click="goTo('/')"
        >
          <template #item="{ item }">
            <button class="truncate max-w-40 inline-block align-middle hover:underline" @click="goTo(item.path)">
              {{ item.name }}
            </button>
          </template>
        </TreeBreadcrumb>
      </div>
      <div class="p-2">
        <TreeList
          :items="children"
          :parent-id="currentParentId"
          :forest-id="forestId"
          class="pl-2 md:pl-4"
          @drop-node="onDropNode"
        >
          <template #item="{ item }">
            <button
              class="px-2 py-1 text-sm text-left w-full hover:bg-gray-50 rounded"
              @click="goTo(item.path)"
            >
              <span class="inline-flex items-center gap-2">
                <Folder v-if="item.type !== 'leaf'" :size="16" class="text-gray-500" aria-hidden="true" />
                <BookOpenCheck v-else :size="16" class="text-gray-500" aria-hidden="true" />
                <span>{{ item.name }}</span>
              </span>
            </button>
          </template>
        </TreeList>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import TreeBreadcrumb from '../components/TreeBreadcrumb.vue'
import TreeList from '../components/TreeList.vue'
import { CONTENT_FOREST, getForest, moveNode } from '../services/tree'
import type { TreeItem } from '../types'
import { Folder, BookOpenCheck } from 'lucide-vue-next'

type Props = {
  path: string
}

const props = defineProps<Props>()
const router = useRouter()

const forestId = CONTENT_FOREST
const forest = computed<TreeItem[]>(() => getForest(forestId))

const currentParentId = computed<number | null>(() => {
  const ids = props.path.split('/').filter(Boolean).map((s) => Number(s)).filter((n) => Number.isFinite(n))
  if (ids.length === 0) return null
  return ids[ids.length - 1] ?? null
})

const children = computed<TreeItem[]>(() => {
  return forest.value
    .filter((n) => n.deletedAt === null)
    .filter((n) => (n.parentId ?? null) === (currentParentId.value ?? null))
    .sort((a, b) => (a.position - b.position) || (a.id - b.id))
})

const goTo = (nextPath: string) => {
  const normalized = nextPath.endsWith('/') ? nextPath : `${nextPath}/`
  router.push({ path: normalized })
}

const onDropNode = (payload: { nodeId: number; newParentId: number | null; newPosition: number }) => {
  if (currentParentId.value == null) return
  moveNode(forestId, payload.nodeId, payload.newParentId, payload.newPosition)
}
</script>



