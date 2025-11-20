<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="px-4 py-2 border-b border-gray-200">
      <TreeBreadcrumb
        :forest-id="forestId"
        :path="pagePath"
        @root-click="goTo('/')"
      >
        <template #item="{ item, index }">
          <template v-if="index < breadcrumbLength - 1">
            <button class="truncate max-w-40 inline-block align-middle hover:underline" @click="goTo(item.path)">
              {{ item.name }}
            </button>
          </template>
          <template v-else>
            <span class="truncate max-w-40 inline-block align-middle">{{ item.name }}</span>
          </template>
        </template>
      </TreeBreadcrumb>
    </div>
    <div class="p-4 mx-auto max-w-5xl">
      <h1 class="text-lg font-semibold mb-3">{{ courseTitle }}</h1>
      <RichTextView v-if="description" :content="description" />
      <div v-if="sections.length > 0" class="mt-4 space-y-2">
        <ul class="space-y-1">
          <li
            v-for="section in sections"
            :key="section.id"
            class="flex items-center justify-between px-0 py-2 rounded-md"
          >
            <span class="text-sm text-gray-900">{{ section.name }}</span>
            <span class="text-xs font-semibold text-white bg-blue-600 px-2 py-0.5 rounded-full shrink-0">
              {{ section.steps.length }}
            </span>
          </li>
        </ul>
      </div>
      <div class="flex gap-2 justify-end mt-4">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          @click="goToEdit"
        >
          Edit
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          @click="goToPreview"
        >
          Preview
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CONTENT_FOREST, getForest } from '../services/tree'
import type { TreeItem, Section } from '../types'
import { getCourse } from '../services/courses'
import RichTextView from '../components/RichTextView.vue'
import TreeBreadcrumb from '../components/TreeBreadcrumb.vue'

const router = useRouter()
const route = useRoute()

const forestId = CONTENT_FOREST
const forest = ref<TreeItem[]>([])

const rawPath = computed(() => (route.params.path as string) || '')
const pagePath = computed(() => {
  const p = rawPath.value
  return p.endsWith('/') ? `/${p}` : `/${p}/`
})

const breadcrumbLength = computed(() =>
  pagePath.value.split('/').filter(Boolean).length
)

const courseTitle = ref('')
const description = ref('')
const nodePath = ref<string>('')
const sections = ref<Section[]>([])

const getNodeIdFromPath = (path: string): number | null => {
  const ids = path.split('/').filter(Boolean).map((s) => Number(s)).filter(Number.isFinite)
  const lastId = ids.length > 0 ? ids[ids.length - 1] : undefined
  return lastId != null ? lastId : null
}

const goTo = (nextPath: string) => {
  const normalized = nextPath.endsWith('/') ? nextPath : `${nextPath}/`
  router.push({ path: normalized })
}

const goToEdit = () => {
  router.push({ path: `/course-editor${nodePath.value}` })
}

const goToPreview = () => {
  router.push({ path: `/course-preview${nodePath.value}` })
}

onMounted(async () => {
  forest.value = await getForest(forestId)

  const nodeId = getNodeIdFromPath(pagePath.value)
  const node = nodeId != null
    ? forest.value.find((n) => n.id === nodeId && n.deletedAt === null)
    : null

  if (!node || node.type !== 'leaf') {
    router.push({ path: '/' })
    return
  }

  nodePath.value = node.path
  courseTitle.value = node.name
  const cid = typeof node.objectId === 'string' ? node.objectId : null
  if (cid) {
    const c = getCourse(cid)
    if (c && c.deletedAt === null) {
      courseTitle.value = c.fullName || node.name
      description.value = c.description || ''
      sections.value = c.structure || []
    }
  }
})
</script>

