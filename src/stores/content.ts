import { ref, computed } from 'vue'
import type { TreeItem, TreeItemPayload } from '../types'
import {
  CONTENT_FOREST,
  getAllTrees,
  sortTreeItems,
  moveNode,
  deleteNode,
  addNode,
} from '../services/tree'

// Store state
const items = ref<TreeItem[]>([])
const refreshKey = ref(0)

// Force reactivity update
function refresh() {
  items.value = getAllTrees()
  refreshKey.value++
}

// Initialize from service
export function initContentStore() {
  refresh()
}

// Getters
export function getContentItems(): TreeItem[] {
  void refreshKey.value // Track dependency
  return items.value.filter((item) => item.deletedAt === null)
}

export function getContentItemsByParent(parentId: number | null): TreeItem[] {
  return getContentItems()
    .filter((item) => (item.parentId ?? null) === (parentId ?? null))
    .sort(sortTreeItems)
}

export function getContentItemById(id: number): TreeItem | undefined {
  return items.value.find((item) => item.id === id && item.deletedAt === null)
}

// Actions
export function addContentItem(parentId: number | null, payload: TreeItemPayload): TreeItem {
  addNode(CONTENT_FOREST, parentId, payload)
  refresh()
  const newItem = items.value.find(
    (item) =>
      item.name === payload.name &&
      item.type === payload.type &&
      (item.parentId ?? null) === (parentId ?? null) &&
      item.deletedAt === null
  )
  if (!newItem) {
    throw new Error('Failed to create content item')
  }
  return newItem
}

export function updateContentItem(id: number, updates: Partial<TreeItemPayload>): void {
  const index = items.value.findIndex((item) => item.id === id)
  if (index === -1) return

  items.value[index] = {
    ...items.value[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  refresh()
}

export function deleteContentItem(id: number): void {
  deleteNode(CONTENT_FOREST, id)
  refresh()
}

export function moveContentItem(
  nodeId: number,
  newParentId: number | null,
  newPosition: number
): void {
  moveNode(CONTENT_FOREST, nodeId, newParentId, newPosition)
  refresh()
}

// Computed
export const contentItems = computed(() => getContentItems())
export const contentItemsByParent = computed(() => (parentId: number | null) =>
  getContentItemsByParent(parentId)
)

