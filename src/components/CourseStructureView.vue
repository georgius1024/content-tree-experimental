<template>
  <div class="space-y-2">
    <!-- Empty state -->
    <div v-if="localStructure.length === 0" class="text-center py-8 text-gray-500 text-sm">
      {{ t('courseStructureView.noSections') }}
    </div>

    <!-- Sortable sections -->
    <Draggable
      v-else
      v-model="localStructure"
      item-key="id"
      tag="div"
      class="space-y-2"
      :animation="200"
      :disabled="readonly"
      handle=".drag-handle"
      @change="onReorder"
    >
      <SectionAccordion
        v-for="(section, index) in localStructure"
        :key="section.id"
        :section="section"
        :section-index="index"
        :readonly="readonly"
        @edit-name="handleEditSectionName(section)"
        @delete="handleDeleteSection(section)"
        @add-slide="handleAddSlide(section)"
        @add-question="handleAddQuestion(section)"
        @edit-slide="handleEditSlide(section, $event)"
        @edit-question="handleEditQuestion(section, $event)"
        @delete-step="handleDeleteStep(section, $event)"
        @reorder-steps="handleReorderSteps(section, $event)"
        @update:section="handleUpdateSection"
      />
    </Draggable>

    <!-- Add Section button -->
    <button
      v-if="!readonly"
      type="button"
      class="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 border-dashed rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors inline-flex items-center justify-center gap-2"
      @click="handleAddSection"
    >
      <Plus :size="16" class="text-gray-500" />
      <span>{{ t('courseStructureView.addSection') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import { Plus } from 'lucide-vue-next'
import type { Section } from '../types'
import SectionAccordion from './SectionAccordion.vue'

const { t } = useI18n()

type Props = {
  structure: Section[]
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:structure': [structure: Section[]]
  'add-section': []
  'edit-section-name': [payload: { sectionId: string }]
  'delete-section': [payload: { sectionId: string }]
  'add-slide': [payload: { sectionId: string }]
  'add-question': [payload: { sectionId: string }]
  'edit-slide': [payload: { sectionId: string; stepId: string }]
  'edit-question': [payload: { sectionId: string; stepId: string }]
  'delete-step': [payload: { sectionId: string; stepId: string }]
}>()

const localStructure = ref<Section[]>([])

watch(
  () => props.structure,
  (structure) => {
    localStructure.value = [...structure]
  },
  { immediate: true }
)

const onReorder = () => {
  // Emit new structure order
  emit('update:structure', [...localStructure.value])
  // Re-sync to parent
  localStructure.value = [...props.structure]
}

const handleAddSection = () => {
  emit('add-section')
}

const handleEditSectionName = (section: Section) => {
  emit('edit-section-name', { sectionId: section.id })
}

const handleDeleteSection = (section: Section) => {
  emit('delete-section', { sectionId: section.id })
}

const handleAddSlide = (section: Section) => {
  emit('add-slide', { sectionId: section.id })
}

const handleAddQuestion = (section: Section) => {
  emit('add-question', { sectionId: section.id })
}

const handleEditSlide = (section: Section, payload: { stepId: string }) => {
  emit('edit-slide', { sectionId: section.id, stepId: payload.stepId })
}

const handleEditQuestion = (section: Section, payload: { stepId: string }) => {
  emit('edit-question', { sectionId: section.id, stepId: payload.stepId })
}

const handleDeleteStep = (section: Section, payload: { stepId: string }) => {
  emit('delete-step', { sectionId: section.id, stepId: payload.stepId })
}

const handleReorderSteps = (section: Section, payload: { newOrder: string[] }) => {
  // Update the specific section with reordered steps
  const stepMap = new Map(section.steps.map(s => [s.id, s]))
  const reorderedSteps = payload.newOrder.map(id => stepMap.get(id)!).filter(Boolean)
  
  const updatedSection: Section = {
    ...section,
    steps: reorderedSteps
  }
  
  // Update structure with modified section
  const updatedStructure = localStructure.value.map(s =>
    s.id === section.id ? updatedSection : s
  )
  
  localStructure.value = updatedStructure
  emit('update:structure', updatedStructure)
}

const handleUpdateSection = (section: Section) => {
  // Update structure with modified section
  const updatedStructure = localStructure.value.map(s =>
    s.id === section.id ? section : s
  )
  
  localStructure.value = updatedStructure
  emit('update:structure', updatedStructure)
}
</script>

<style scoped>
:deep(.drag-ghost) {
  border: 2px dashed #d1d5db; /* gray-300 */
  background: #f9fafb; /* gray-50 */
  border-radius: 0.5rem;
  opacity: 0.6;
}
</style>

