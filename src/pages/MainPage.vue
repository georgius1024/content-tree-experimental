<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <Toolbar :title="t('mainPage.title')">
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
            <button
              type="button"
              class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              @click="onResetTree"
            >
              {{ t('mainPage.resetTree') }}
            </button>
      </template>
    </Toolbar>
    <div class="p-4">
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
        <ContentList
          :items="children"
          :parent-id="currentParentId"
          :forest-id="forestId"
          class="pl-2 md:pl-4"
          @drop-node="onDropNode"
          @click="onItemClick"
          @edit="onEditItem"
          @delete="onDeleteItem"
          @drop-into="onDropInto"
        />
      </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Toolbar from '../components/Toolbar.vue'
import TreeBreadcrumb from '../components/TreeBreadcrumb.vue'
import ContentList from '../components/ContentList.vue'
import { CONTENT_FOREST, getForest, moveNode, deleteNode, resetAllTrees, sortTreeItems } from '../services/tree'
import type { TreeItem } from '../types'
import { softDeleteCourse, resetAllCourses } from '../services/courses'

const { t, locale } = useI18n()

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
  void refreshKey.value
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

const onItemClick = (payload: { itemId: number }) => {
  const item = forest.value.find((n) => n.id === payload.itemId && n.deletedAt === null)
  if (!item) return
  if (item.type !== 'leaf') {
    goTo(item.path)
  }
}

const onEditItem = (payload: { itemId: number }) => {
  const item = forest.value.find((n) => n.id === payload.itemId && n.deletedAt === null)
  if (!item) return
  if (item.type === 'leaf') {
    router.push({ path: `/course${item.path}` })
    return
  }
  router.push({ path: `/folder${item.path}` })
}

const onDeleteItem = (payload: { itemId: number }) => {
  const itemId = payload.itemId
  const forest = getForest(forestId)
  const item = forest.find((n) => n.id === itemId && n.deletedAt === null)
  if (!item) return
  const message = item.type === 'leaf'
    ? t('mainPage.deleteConfirm')
    : t('mainPage.deleteFolderConfirm')
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
  const ok = window.confirm(t('mainPage.resetConfirm'))
  if (!ok) return
  const currentLocale = locale.value as 'en' | 'ru'
  resetAllTrees(currentLocale)
  resetAllCourses(currentLocale)
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
    alert(t('mainPage.selectFolderFirst'))
    return
  }
  router.push({ path: '/course/new', query: { parentId: parentId.toString() } })
}
</script>



