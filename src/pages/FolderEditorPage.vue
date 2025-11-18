<template>
  <div class="mx-auto max-w-2xl">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <h1 class="text-lg font-semibold">{{ isNew ? t('folderEditor.newTitle') : t('folderEditor.title') }}</h1>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('common.name') }}</label>
          <input
            v-model="name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder="t('folderEditor.namePlaceholder')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('common.parent') }}</label>
          <FolderPicker
            :forest-id="forestId"
            :current-folder-id="nodeId"
            :exclude-descendants-of="nodeId"
            :value="selectedParentId"
            :allow-root="true"
            @update:value="selectedParentId = $event"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            @click="goBack"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isValid"
            @click="onSave"
          >
            {{ isNew ? t('common.create') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CONTENT_FOREST, getForest, updateNode, addNode } from '../services/tree'
import type { TreeItem } from '../types'
import FolderPicker from '../components/FolderPicker.vue'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const forestId = CONTENT_FOREST
const nodeId = ref<number | null>(null)
const name = ref('')
const selectedParentId = ref<number | null>(null)

const forest = ref<TreeItem[]>([])

const loadForest = async () => {
  forest.value = await getForest(forestId)
}

const isNew = computed(() => route.path === '/folder/new')

const node = computed<TreeItem | null>(() => {
  return nodeId.value != null ? forest.value.find((n) => n.id === nodeId.value && n.deletedAt === null) ?? null : null
})

const isValid = computed(() => {
  return Boolean(name.value.trim())
})

const getNodeIdFromPath = (path: string): number | null => {
  const ids = path.split('/').filter(Boolean).map((s) => Number(s)).filter((n) => Number.isFinite(n))
  const lastId = ids.length > 0 ? ids[ids.length - 1] : undefined
  return lastId != null ? lastId : null
}

onMounted(async () => {
  await loadForest()
  if (isNew.value) {
    // Creation mode: get parent from query
    const parentIdParam = route.query.parentId
    if (parentIdParam) {
      const parsed = Number(parentIdParam)
      if (Number.isFinite(parsed)) {
        selectedParentId.value = parsed
      }
    }
    // Don't set nodeId for new items
    nodeId.value = null
  } else {
    // Edit mode: load existing node
    const path = (route.params.path as string) || ''
    const normalized = path.endsWith('/') ? path : `${path}/`
    nodeId.value = getNodeIdFromPath(normalized)
    if (node.value) {
      name.value = node.value.name
      selectedParentId.value = node.value.parentId ?? null
    } else {
      router.push({ path: '/' })
    }
  }
})

const onSave = async () => {
  if (!name.value.trim()) return

  if (isNew.value) {
    // Create new folder
    await addNode(forestId, selectedParentId.value, {
      name: name.value.trim(),
      type: 'branch'
    })
    const parentPath = selectedParentId.value
      ? forest.value.find((n) => n.id === selectedParentId.value)?.path ?? '/'
      : '/'
    router.push({ path: parentPath })
  } else {
    // Update existing folder
    if (!nodeId.value) return
    await updateNode(forestId, nodeId.value, name.value.trim(), selectedParentId.value)
    const parentPath = selectedParentId.value
      ? forest.value.find((n) => n.id === selectedParentId.value)?.path ?? '/'
      : '/'
    router.push({ path: parentPath })
  }
}

const goBack = () => {
  if (isNew.value) {
    const parentPath = selectedParentId.value
      ? forest.value.find((n) => n.id === selectedParentId.value)?.path ?? '/'
      : '/'
    router.push({ path: parentPath })
  } else {
    const currentNode = node.value
    if (currentNode) {
      const parentPath = currentNode.parentId
        ? forest.value.find((n) => n.id === currentNode.parentId && n.deletedAt === null)?.path ?? '/'
        : '/'
      router.push({ path: parentPath })
    } else {
      router.push({ path: '/' })
    }
  }
}
</script>

