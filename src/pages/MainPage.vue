<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <!-- <Toolbar :title="t('mainPage.title')">
      <template #end>
            <button
              type="button"
              class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              @click="onAddFolder"
              :title="t('mainPage.addSubFolderTitle')"
            >
              {{ t('mainPage.addFolder') }}
            </button>
            <button
              type="button"
              class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              @click="onAddObject"
              :title="t('mainPage.addCourseTitle')"
            >
              {{ t('mainPage.addCourse') }}
            </button>
      </template>
    </Toolbar> -->
    <div class="px-4 py-2 border-b border-gray-200">
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
    <div class="py-2">
        <div v-if="isLoading" class="flex items-center justify-center py-8 text-gray-500 text-sm">
          {{ t('mainPage.loading') }}
        </div>
        <ContentList
          v-else
          :items="children"
          :parent-id="currentParentId"
          :forest-id="forestId"
          class="px-2"
          @drop-node="onDropNode"
          @click="onItemClick"
          @edit="onEditItem"
          @delete="onDeleteItem"
          @drop-into="onDropInto"
        />
        <div v-if="!isLoading" class="px-2 pt-2 flex gap-2 border-t border-gray-100">
          <button
            type="button"
            class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            @click="onAddFolder"
            :title="t('mainPage.addSubFolderTitle')"
          >
            {{ t('mainPage.addFolder') }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="currentParentId == null"
            @click="onAddObject"
            :title="currentParentId == null ? t('mainPage.selectFolderFirst') : t('mainPage.addCourseTitle')"
          >
            {{ t('mainPage.addCourse') }}
          </button>
        </div>
      </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Toolbar from '../components/Toolbar.vue'
import TreeBreadcrumb from '../components/TreeBreadcrumb.vue'
import ContentList from '../components/ContentList.vue'
import { CONTENT_FOREST, getForest, moveNode, deleteNode, sortTreeItems } from '../services/tree'
import type { TreeItem } from '../types'
import { softDeleteCourse } from '../services/courses'

const { t } = useI18n()

type Props = {
  path: string
}

const props = defineProps<Props>()
const router = useRouter()

const forestId = CONTENT_FOREST
const isLoading = ref(false)
const forest = ref<TreeItem[]>([])
const refreshKey = ref(0)

const draggingNodeId = ref<number | null>(null)

const currentParentId = computed<number | null>(() => {
  const ids = props.path.split('/').filter(Boolean).map((s) => Number(s)).filter((n) => Number.isFinite(n))
  if (ids.length === 0) return null
  return ids[ids.length - 1] ?? null
})

const children = computed<TreeItem[]>(() => {
  void refreshKey.value
  return forest.value
    .filter((n) => n.deletedAt === null)
    .filter((n) => (n.parentId ?? null) === (currentParentId.value ?? null))
    .sort(sortTreeItems)
})

const loadForest = async () => {
  isLoading.value = true
  try {
    forest.value = await getForest(forestId)
    refreshKey.value++
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadForest()
})

watch(() => props.path, () => {
  loadForest()
})

const goTo = (nextPath: string) => {
  console.log('goTo', nextPath, router.currentRoute.value.path)
  const normalized = nextPath.endsWith('/') ? nextPath : `${nextPath}/`
  router.push({ path: normalized })
}

const onDropNode = async (payload: { nodeId: number; newParentId: number | null; newPosition: number }) => {
  console.log('onDropNode', payload)
  if (currentParentId.value == null) return
  isLoading.value = true
  try {
    await moveNode(forestId, payload.nodeId, payload.newParentId, payload.newPosition)
    await loadForest()
  } finally {
    isLoading.value = false
  }
}

const onBreadcrumbDrop = async (payload: { newParentId: number | null; newPosition: number }) => {
  if (draggingNodeId.value == null) return
  isLoading.value = true
  try {
    await moveNode(forestId, draggingNodeId.value, payload.newParentId, payload.newPosition)
    draggingNodeId.value = null
    await loadForest()
  } finally {
    isLoading.value = false
  }
}

const onDropInto = async (payload: { nodeId: number; targetParentId: number }) => {
  // Prevent false alarm: don't try to move a node into itself
  if (payload.nodeId === payload.targetParentId) {
    return
  }
  isLoading.value = true
  try {
    const currentForest = await getForest(forestId)
    const node = currentForest.find((n) => n.id === payload.nodeId && n.deletedAt === null)
    if (!node) return
    
    // Prevent moving a node into its own descendant
    const targetParent = currentForest.find((n) => n.id === payload.targetParentId && n.deletedAt === null)
    if (targetParent && targetParent.path.startsWith(node.path)) {
      return
    }
    
    const childrenCount = currentForest
      .filter((n) => n.deletedAt === null)
      .filter((n) => (n.parentId ?? null) === payload.targetParentId).length
    await moveNode(forestId, payload.nodeId, payload.targetParentId, childrenCount)
    await loadForest()
  } finally {
    isLoading.value = false
  }
}

const onItemClick = (payload: { itemId: number }) => {
  const item = forest.value.find((n) => n.id === payload.itemId && n.deletedAt === null)
  if (!item) return
  if (item.type !== 'leaf') {
    goTo(item.path)
    return
  }
  router.push({ path: `/course${item.path}` })
}

const onEditItem = (payload: { itemId: number }) => {
  const item = forest.value.find((n) => n.id === payload.itemId && n.deletedAt === null)
  if (!item) return
  if (item.type === 'leaf') {
    router.push({ path: `/course${item.path}edit` })
    return
  }
  router.push({ path: `/folder${item.path}` })
}

const onDeleteItem = async (payload: { itemId: number }) => {
  const itemId = payload.itemId
  const currentForest = await getForest(forestId)
  const item = currentForest.find((n) => n.id === itemId && n.deletedAt === null)
  if (!item) return
  const message = item.type === 'leaf'
    ? t('mainPage.deleteConfirm')
    : t('mainPage.deleteFolderConfirm')
  const ok = window.confirm(message)
  if (!ok) return

  isLoading.value = true
  try {
    // Soft-delete courses for the node and all descendants about to be deleted
    const affected = currentForest
      .filter((n) => n.deletedAt === null)
      .filter((n) => n.path.startsWith(item.path)) // includes item + descendants
    const leavesWithCourses = affected.filter(
      (n) => n.type === 'leaf' && typeof n.objectId === 'string' && n.objectId
    )
    await Promise.all(
      leavesWithCourses.map((n) => softDeleteCourse(n.objectId as string))
    )

    await deleteNode(forestId, itemId)
    await loadForest()
  } finally {
    isLoading.value = false
  }
}

const onAddFolder = () => {
  const parentId = currentParentId.value
  const query = parentId != null ? { parentId: parentId.toString() } : {}
  router.push({ path: '/folder/new', query })
}

const onAddObject = () => {
  const parentId = currentParentId.value
  if (parentId == null) {
    alert(t('mainPage.selectFolderFirst'))
    return
  }
  router.push({ path: '/course/new', query: { parentId: parentId.toString() } })
}
</script>



