<template>
  <div class="mx-auto max-w-2xl">
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <h1 class="text-lg font-semibold">{{ isNew ? t('courseEditor.newTitle') : t('courseEditor.title') }}</h1>
      </div>
      <TabGroup :selected-index="selectedTab" @change="selectedTab = $event">
        <TabList class="flex border-b border-gray-200">
          <Tab
            v-for="(tab, index) in tabs"
            :key="index"
            as="button"
            type="button"
            class="px-4 py-2 text-sm font-medium focus:outline-none transition-colors"
            :class="
              selectedTab === index
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            "
          >
            {{ tab.label }}
          </Tab>
        </TabList>
        <TabPanels class="p-4">
          <TabPanel class="space-y-4">
            <!-- Tree name (used in tree) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('courseEditor.nameLabel') }}</label>
              <input
                v-model="name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="t('courseEditor.namePlaceholder')"
              />
            </div>

            <!-- Course details -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('courseEditor.fullName') }}</label>
                <input
                  v-model="fullName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('courseEditor.fullNamePlaceholder')"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('courseEditor.author') }}</label>
                <input
                  v-model="author"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('courseEditor.authorPlaceholder')"
                />
              </div>
            </div>

            <!-- Folder (must be non-root) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('common.folder') }}</label>
              <FolderPicker
                :forest-id="forestId"
                :current-folder-id="nodeId"
                :value="selectedParentId"
                :allow-root="false"
                @update:value="selectedParentId = $event"
              />
              <p v-if="!selectedParentId" class="mt-1 text-xs text-red-500">
                {{ t('courseEditor.folderRequired') }}
              </p>
            </div>
          </TabPanel>
          <TabPanel>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('courseEditor.description') }}</label>
              <RichTextEditor
                key="description-editor"
                v-model="description"
                :placeholder="t('courseEditor.descriptionPlaceholder')"
              />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <div class="p-4 border-t border-gray-200 flex gap-2 justify-end">
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { CONTENT_FOREST, getForest, updateNode, attachObjectId, addNode } from '../services/tree'
import type { TreeItem } from '../types'
import FolderPicker from '../components/FolderPicker.vue'
import RichTextEditor from '../components/RichTextEditor.vue'
import { getCourse, createCourse, updateCourse } from '../services/courses'

const { t } = useI18n()

const selectedTab = ref(0)

const tabs = computed(() => [
  { label: t('courseEditor.tabGeneral') },
  { label: t('courseEditor.tabDescription') }
])

const router = useRouter()
const route = useRoute()

const forestId = CONTENT_FOREST
const nodeId = ref<number | null>(null)
const name = ref('')
const selectedParentId = ref<number | null>(null)

const author = ref('')
const fullName = ref('')
const description = ref('')

const forest = computed<TreeItem[]>(() => getForest(forestId))

const isNew = computed(() => route.path === '/course/new')

const node = computed<TreeItem | null>(() => {
  return nodeId.value != null ? forest.value.find((n) => n.id === nodeId.value && n.deletedAt === null) ?? null : null
})

const isValid = computed(() => {
  return Boolean(name.value.trim() && selectedParentId.value != null)
})

const getNodeIdFromPath = (path: string): number | null => {
  const ids = path.split('/').filter(Boolean).map((s) => Number(s)).filter((n) => Number.isFinite(n))
  const lastId = ids.length > 0 ? ids[ids.length - 1] : undefined
  return lastId != null ? lastId : null
}

onMounted(() => {
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
    if (node.value && node.value.type === 'leaf') {
      name.value = node.value.name
      selectedParentId.value = node.value.parentId ?? null

      const cid = node.value.objectId
      if (typeof cid === 'string' && cid) {
        const c = getCourse(cid)
        if (c && c.deletedAt === null) {
          author.value = c.author
          fullName.value = c.fullName
          description.value = c.description
        }
      } else {
        // no course yet; initialize with sensible defaults
        fullName.value = name.value
      }
    } else {
      router.push({ path: '/' })
    }
  }
})

const onSave = () => {
  if (!name.value.trim() || selectedParentId.value == null) return

  if (isNew.value) {
    // Create new course
    const course = createCourse({
      author: author.value,
      fullName: fullName.value || name.value.trim(),
      description: description.value
    })

    // Create the tree node
    addNode(forestId, selectedParentId.value, {
      name: name.value.trim(),
      type: 'leaf'
    })

    // Find the newly created node and attach the course ID
    const updatedForest = getForest(forestId)
    const newNode = updatedForest
      .filter((n) => n.deletedAt === null)
      .filter((n) => n.parentId === selectedParentId.value)
      .filter((n) => n.name === name.value.trim())
      .filter((n) => n.type === 'leaf')
      .sort((a, b) => b.id - a.id)[0] // Get the most recently created (highest ID)

    if (newNode) {
      attachObjectId(forestId, newNode.id, course.id)
    }

    const parentPath = selectedParentId.value
      ? forest.value.find((n) => n.id === selectedParentId.value)?.path ?? '/'
      : '/'
    router.push({ path: parentPath })
  } else {
    // Update existing course
    if (!nodeId.value) return

    // Upsert course
    const existingId = node.value?.objectId
    if (typeof existingId === 'string' && existingId) {
      updateCourse(existingId, {
        author: author.value,
        fullName: fullName.value,
        description: description.value
      })
    } else {
      const created = createCourse({
        author: author.value,
        fullName: fullName.value || name.value.trim(),
        description: description.value
      })
      attachObjectId(forestId, nodeId.value, created.id)
    }

    // Update tree (name + parent)
    updateNode(forestId, nodeId.value, name.value.trim(), selectedParentId.value)

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


