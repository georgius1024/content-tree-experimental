<template>
  <div class="mx-auto max-w-2xl">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="p-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
          <h2 class="text-sm font-medium text-gray-700">Content</h2>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              @click="onAddFolder"
              title="Add sub-folder to selected parent"
            >
              Add folder
            </button>
            <button
              type="button"
              class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              @click="onAddObject"
              title="Add course to selected parent"
            >
              Add course
            </button>
            <button
              type="button"
              class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              @click="onResetTree"
            >
              Reset tree
            </button>
          </div>
        </div>
        <TreeBreadcrumb
          :forest-id="forestId"
          :path="path"
          @root-click="goTo('/')"
          @breadcrumb-drop="onBreadcrumbDrop"
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
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
          @drop-into="onDropInto"
        >
          <template #item="{ item }">
            <button
              type="button"
              class="px-2 py-1 text-sm text-left w-full rounded transition hover:bg-gray-50 group"
              :class="item.type !== 'leaf' ? 'cursor-pointer' : ''"
              @click="item.type !== 'leaf' && goTo(item.path)"
            >
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-2">
                  <Folder v-if="item.type !== 'leaf'" :size="16" class="text-gray-500" aria-hidden="true" />
                  <BookOpenCheck v-else :size="16" class="text-gray-500" aria-hidden="true" />
                  <span :class="item.type !== 'leaf' ? 'group-hover:underline' : ''">{{ item.name }}</span>
                </span>
                <span class="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    class="rounded p-1 hover:bg-gray-100"
                    aria-label="Edit"
                    @click.stop="onEditItem(item.id)"
                  >
                    <Pencil :size="14" class="text-gray-500" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="rounded p-1 hover:bg-gray-100"
                    aria-label="Delete"
                    @click.stop="onDeleteItem(item.id)"
                  >
                    <Trash2 :size="14" class="text-gray-500" aria-hidden="true" />
                  </button>
                </span>
              </div>
            </button>
          </template>
        </TreeList>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import TreeBreadcrumb from '../components/TreeBreadcrumb.vue'
import TreeList from '../components/TreeList.vue'
import { CONTENT_FOREST, getForest, moveNode, deleteNode, resetAllTrees, sortTreeItems } from '../services/tree'
import type { TreeItem } from '../types'
import { Folder, BookOpenCheck, Pencil, Trash2 } from 'lucide-vue-next'
import { softDeleteCourse, resetAllCourses } from '../services/courses'

type Props = {
  path: string
}

const props = defineProps<Props>()
const router = useRouter()

const forestId = CONTENT_FOREST
const refreshKey = ref(0)
const forest = computed<TreeItem[]>(() => {
  void refreshKey.value
  return getForest(forestId)
})

const draggingNodeId = ref<number | null>(null)

const currentParentId = computed<number | null>(() => {
  const ids = props.path.split('/').filter(Boolean).map((s) => Number(s)).filter((n) => Number.isFinite(n))
  if (ids.length === 0) return null
  return ids[ids.length - 1] ?? null
})

const children = computed<TreeItem[]>(() => {
  return forest.value
    .filter((n) => n.deletedAt === null)
    .filter((n) => (n.parentId ?? null) === (currentParentId.value ?? null))
    .sort(sortTreeItems)
})

const goTo = (nextPath: string) => {
  console.log('goTo', nextPath, router.currentRoute.value.path)
  const normalized = nextPath.endsWith('/') ? nextPath : `${nextPath}/`
  router.push({ path: normalized })
}

const onDropNode = (payload: { nodeId: number; newParentId: number | null; newPosition: number }) => {
  console.log('onDropNode', payload)
  if (currentParentId.value == null) return
  moveNode(forestId, payload.nodeId, payload.newParentId, payload.newPosition)
  refreshKey.value++
}

const onDragStart = (payload: { nodeId: number }) => {
  draggingNodeId.value = payload.nodeId
}

const onDragEnd = (_payload: { nodeId: number | null }) => {
  draggingNodeId.value = null
}

const onBreadcrumbDrop = (payload: { newParentId: number | null; newPosition: number }) => {
  if (draggingNodeId.value == null) return
  moveNode(forestId, draggingNodeId.value, payload.newParentId, payload.newPosition)
  draggingNodeId.value = null
  refreshKey.value++
}

const onDropInto = (payload: { nodeId: number; targetParentId: number }) => {
  const forest = getForest(forestId)
  const childrenCount = forest
    .filter((n) => n.deletedAt === null)
    .filter((n) => (n.parentId ?? null) === payload.targetParentId).length
  moveNode(forestId, payload.nodeId, payload.targetParentId, childrenCount)
  refreshKey.value++
}

const onEditItem = (itemId: number) => {
  const item = forest.value.find((n) => n.id === itemId && n.deletedAt === null)
  if (!item) return
  if (item.type === 'leaf') {
    router.push({ path: `/course${item.path}` })
    return
  }
  router.push({ path: `/folder${item.path}` })
}

const onDeleteItem = (itemId: number) => {
  const forest = getForest(forestId)
  const item = forest.find((n) => n.id === itemId && n.deletedAt === null)
  if (!item) return
  const message = item.type === 'leaf'
    ? 'Delete this item?'
    : 'Delete this folder and all its descendants?'
  const ok = window.confirm(message)
  if (!ok) return

  // Soft-delete courses for the node and all descendants about to be deleted
  const affected = forest
    .filter((n) => n.deletedAt === null)
    .filter((n) => n.path.startsWith(item.path)) // includes item + descendants
  const leavesWithCourses = affected.filter(
    (n) => n.type === 'leaf' && typeof n.objectId === 'string' && n.objectId
  )
  leavesWithCourses.forEach((n) => {
    softDeleteCourse(n.objectId as string)
  })

  deleteNode(forestId, itemId)
  refreshKey.value++
}

const onResetTree = () => {
  const ok = window.confirm('Reset tree to the initial sample?')
  if (!ok) return
  resetAllTrees()
  resetAllCourses()
  refreshKey.value++
  goTo('/')
}

const onAddFolder = () => {
  const parentId = currentParentId.value
  const query = parentId != null ? { parentId: parentId.toString() } : {}
  router.push({ path: '/folder/new', query })
}

const onAddObject = () => {
  const parentId = currentParentId.value
  if (parentId == null) {
    alert('Please select a folder first')
    return
  }
  router.push({ path: '/course/new', query: { parentId: parentId.toString() } })
}
</script>



