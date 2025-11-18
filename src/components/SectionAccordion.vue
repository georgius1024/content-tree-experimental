<template>
  <div class="border border-gray-200 rounded-md">
    <Accordion :open="isOpen" @update:open="isOpen = $event" caret-position="left" :header-hover="true" header-group>
      <template #header>
        <div class="flex items-center justify-between w-full pr-2">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- Drag handle (visible on hover) -->
            <button
              v-if="!readonly"
              type="button"
              class="drag-handle shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 cursor-move"
              :title="t('common.drag')"
            >
              <GripVertical :size="16" />
            </button>

            <!-- Section name -->
            <span class="font-medium text-gray-900 truncate">{{ section.name }}</span>

            <!-- Step count badge -->
            <span class="text-xs font-semibold text-white bg-blue-600 px-2 py-0.5 rounded-full shrink-0">
              {{ section.steps.length }}
            </span>
          </div>

          <!-- Action buttons (visible on hover) -->
          <div
            v-if="!readonly"
            class="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <button
              type="button"
              class="rounded p-1 hover:bg-gray-100"
              :aria-label="t('common.edit')"
              @click.stop="handleEdit"
            >
              <Pencil :size="14" class="text-gray-500" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="rounded p-1 hover:bg-gray-100"
              :aria-label="t('common.delete')"
              @click.stop="handleDelete"
            >
              <Trash2 :size="14" class="text-gray-500" aria-hidden="true" />
            </button>
          </div>
        </div>
      </template>

      <!-- StepList in collapsed content -->
      <div class="px-4 pb-4 pt-2">
        <StepList
          :steps="section.steps"
          :section-id="section.id"
          :readonly="readonly"
          @add-slide="handleAddSlide"
          @add-question="handleAddQuestion"
          @edit-slide="handleEditSlide"
          @edit-question="handleEditQuestion"
          @delete-step="handleDeleteStep"
          @reorder-steps="handleReorderSteps"
        />
      </div>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { GripVertical, Pencil, Trash2 } from 'lucide-vue-next'
import type { Section } from '../types'
import Accordion from './Accordion.vue'
import StepList from './StepList.vue'

const { t } = useI18n()

type Props = {
  section: Section
  sectionIndex: number
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'edit-name': []
  'delete': []
  'update:section': [section: Section]
  'add-slide': []
  'add-question': []
  'edit-slide': [payload: { stepId: string }]
  'edit-question': [payload: { stepId: string }]
  'delete-step': [payload: { stepId: string }]
  'reorder-steps': [payload: { newOrder: string[] }]
}>()

const isOpen = ref(false)

const handleEdit = () => {
  emit('edit-name')
}

const handleDelete = () => {
  emit('delete')
}

const handleAddSlide = () => {
  emit('add-slide')
}

const handleAddQuestion = () => {
  emit('add-question')
}

const handleEditSlide = (payload: { stepId: string }) => {
  emit('edit-slide', payload)
}

const handleEditQuestion = (payload: { stepId: string }) => {
  emit('edit-question', payload)
}

const handleDeleteStep = (payload: { stepId: string }) => {
  emit('delete-step', payload)
}

const handleReorderSteps = (payload: { newOrder: string[] }) => {
  // Update section with reordered steps
  const stepMap = new Map(props.section.steps.map(s => [s.id, s]))
  const reorderedSteps = payload.newOrder.map(id => stepMap.get(id)!).filter(Boolean)
  
  const updatedSection: Section = {
    ...props.section,
    steps: reorderedSteps
  }
  
  emit('update:section', updatedSection)
}
</script>

