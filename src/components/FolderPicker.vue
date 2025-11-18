<template>
  <GeneralFolderPicker
    :folders="availableFolders"
    :selected-folder-id="value"
    :get-folder-path="folderPath"
    :on-select="handleSelect"
    :allow-root="allowRoot"
    :root-text="rootText"
    :select-folder-button-text="selectFolderButtonText"
    :no-folders-found-text="noFoldersFoundText"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import GeneralFolderPicker from './GeneralFolderPicker.vue'
import type { TreeItem } from '../types'
import { getForest, sortTreeItems } from '../services/tree'

const { t } = useI18n()

type Props = {
  forestId: number
  currentFolderId: number | null
  value: number | null
  excludeDescendantsOf?: number | null
  allowRoot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  excludeDescendantsOf: null,
  allowRoot: true
})

const emit = defineEmits<{
  (e: 'update:value', value: number | null): void
}>()

const forest = ref<TreeItem[]>([])

const loadForest = async () => {
  forest.value = await getForest(props.forestId)
}

onMounted(() => {
  loadForest()
})

watch(() => props.forestId, () => {
  loadForest()
})

const availableFolders = computed<TreeItem[]>(() => {
  const excludeId = props.excludeDescendantsOf
  return forest.value
    .filter((n) => n.deletedAt === null && n.type !== 'leaf')
    .filter((n) => {
      if (!excludeId || !n.path) return true
      const excludeNode = forest.value.find((item) => item.id === excludeId)
      if (!excludeNode) return true
      return !n.path.startsWith(excludeNode.path)
    })
    .sort(sortTreeItems)
})

const folderPath = (folder: TreeItem): string => {
  const ids = folder.path.split('/').filter(Boolean).map((s) => Number(s)).filter((n) => Number.isFinite(n))
  const pathItems: string[] = []
  ids.forEach((id) => {
    const item = forest.value.find((n) => n.id === id && n.deletedAt === null)
    if (item) {
      pathItems.push(item.name)
    }
  })
  return pathItems.length > 0 ? pathItems.join(' / ') : folder.name
}

const rootText = computed(() => t('folderPicker.root'))
const selectFolderButtonText = computed(() => t('folderPicker.selectFolderButton'))
const noFoldersFoundText = computed(() => t('folderPicker.noFoldersFound'))

const handleSelect = (folderId: number | null) => {
  emit('update:value', folderId)
}
</script>
