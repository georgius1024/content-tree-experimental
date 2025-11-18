<template>
  <div class="space-y-2">
    <!-- Empty state -->
    <div v-if="steps.length === 0" class="text-center py-8 text-gray-500 text-sm">
      {{ t('stepList.noSteps') }}
    </div>

    <!-- Steps list -->
    <Draggable
      v-else
      v-model="localSteps"
      item-key="id"
      tag="div"
      class="space-y-1"
      :animation="200"
      :disabled="readonly"
      handle=".drag-handle"
      @change="onReorder"
    >
      <StepListItem
        v-for="(step, index) in localSteps"
        :key="step.id"
        :step="step"
        :index="index"
        :readonly="readonly"
        @edit="handleEdit(step)"
        @delete="handleDelete(step)"
      />
    </Draggable>

    <!-- Add buttons -->
    <div v-if="editable && !readonly" class="flex gap-2 pt-2">
      <button
        type="button"
        class="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 border-dashed rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors inline-flex items-center justify-center gap-2"
        @click="handleAddSlide"
      >
        <FileText :size="16" class="text-gray-500" />
        <span>{{ t('stepList.addSlide') }}</span>
      </button>
      <button
        type="button"
        class="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 border-dashed rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors inline-flex items-center justify-center gap-2"
        @click="handleAddQuestion"
      >
        <HelpCircle :size="16" class="text-gray-500" />
        <span>{{ t('stepList.addQuestion') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import { FileText, HelpCircle } from 'lucide-vue-next'
import type { Step } from '../types'
import StepListItem from './StepListItem.vue'

const { t } = useI18n()

type Props = {
  steps: Step[]
  sectionId: string
  editable?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  readonly: false
})

const emit = defineEmits<{
  'add-slide': []
  'add-question': []
  'edit-slide': [payload: { stepId: string }]
  'edit-question': [payload: { stepId: string }]
  'delete-step': [payload: { stepId: string }]
  'reorder-steps': [payload: { newOrder: string[] }] // Array of step IDs in new order
}>()

const localSteps = ref<Step[]>([])

watch(
  () => props.steps,
  (steps) => {
    localSteps.value = [...steps]
  },
  { immediate: true }
)

const onReorder = (evt: { moved?: { oldIndex: number; newIndex: number } }) => {
  if (!evt.moved) {
    // Re-sync in case of no-op
    localSteps.value = [...props.steps]
    return
  }

  // Emit new order (array of step IDs)
  const newOrder = localSteps.value.map(step => step.id)
  emit('reorder-steps', { newOrder })
  
  // Re-sync to parent (source of truth)
  localSteps.value = [...props.steps]
}

const handleAddSlide = () => {
  emit('add-slide')
}

const handleAddQuestion = () => {
  emit('add-question')
}

const handleEdit = (step: Step) => {
  if (step.type === 'slide') {
    emit('edit-slide', { stepId: step.id })
  } else {
    emit('edit-question', { stepId: step.id })
  }
}

const handleDelete = (step: Step) => {
  emit('delete-step', { stepId: step.id })
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

