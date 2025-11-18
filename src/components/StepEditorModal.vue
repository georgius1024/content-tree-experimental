<template>
  <TransitionRoot :show="open" as="template">
    <Dialog :open="open" @close="handleClose" class="relative z-60">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="w-full max-w-3xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between p-6 border-b">
              <DialogTitle class="text-lg font-semibold">
                {{ isCreating ? t('stepEditorModal.createTitle') : t('stepEditorModal.editTitle') }}
                {{ stepType === 'slide' ? t('stepEditorModal.slide') : t('stepEditorModal.question') }}
              </DialogTitle>
              <button
                type="button"
                class="rounded p-1 hover:bg-gray-100"
                @click="handleClose"
              >
                <X :size="20" class="text-gray-500" />
              </button>
            </div>

            <div class="p-6 overflow-y-auto flex-1">
              <SlideEditor
                v-if="isSlide && localSlide"
                :key="slideEditorKey"
                :model-value="localSlide"
                @update:model-value="updateSlide"
              />
              <QuestionEditor
                v-if="isQuestion && localQuestion"
                :key="questionEditorKey"
                :model-value="localQuestion"
                @update:model-value="updateQuestion"
                @update:valid="questionValid = $event"
              />
            </div>

            <div class="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                @click="handleClose"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                v-if="isSlide"
                type="button"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                @click="handleSaveSlide"
              >
                {{ t('common.save') }}
              </button>
              <button
                v-if="isQuestion"
                type="button"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!questionValid"
                @click="handleSaveQuestion"
              >
                {{ t('common.save') }}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X } from 'lucide-vue-next'
import type { Step, Slide, Question } from '../types'
import SlideEditor from './SlideEditor.vue'
import QuestionEditor from './QuestionEditor.vue'

const { t } = useI18n()

type Props = {
  step: Step | null
  open: boolean
  stepType?: 'slide' | 'question' // Required when step is null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  'save': [step: Step]
}>()

const localSlide = ref<Slide | null>(null)
const localQuestion = ref<Question | null>(null)
const questionValid = ref(false)

const isCreating = computed(() => props.step === null)
const isSlide = computed(() => props.step?.type === 'slide' || (!props.step && props.stepType === 'slide'))
const isQuestion = computed(() => props.step?.type === 'question' || (!props.step && props.stepType === 'question'))

const slideEditorKey = computed(() => {
  return localSlide.value ? `slide-${localSlide.value.id}-${props.open}` : 'new-slide'
})

const questionEditorKey = computed(() => {
  return localQuestion.value ? `question-${localQuestion.value.id}-${props.open}` : 'new-question'
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.step) {
        if (props.step.type === 'slide') {
          localSlide.value = {
            id: props.step.id,
            type: props.step.type,
            name: props.step.name,
            content: props.step.content
          }
          localQuestion.value = null
        } else {
          localQuestion.value = {
            id: props.step.id,
            type: props.step.type,
            name: props.step.name,
            slide: props.step.slide,
            options: [...props.step.options],
            inputRule: {
              type: props.step.inputRule.type,
              correctOptions: [...props.step.inputRule.correctOptions]
            }
          }
          localSlide.value = null
        }
        questionValid.value = true
      } else {
        // Creating new step
        if (props.stepType === 'slide') {
          localSlide.value = {
            id: `slide-${Math.random().toString(36).substr(2, 9)}`,
            type: 'slide',
            name: '',
            content: ''
          }
          localQuestion.value = null
        } else {
          localQuestion.value = {
            id: `question-${Math.random().toString(36).substr(2, 9)}`,
            type: 'question',
            name: '',
            slide: '',
            options: ['', ''],
            inputRule: {
              type: 'single',
              correctOptions: []
            }
          }
          localSlide.value = null
          questionValid.value = false
        }
      }
    }
  }
)

const updateSlide = (updatedSlide: Slide) => {
  localSlide.value = updatedSlide
}

const updateQuestion = (updatedQuestion: Question) => {
  localQuestion.value = updatedQuestion
}

const handleClose = () => {
  emit('update:open', false)
}

const handleSaveSlide = () => {
  if (!localSlide.value) return
  emit('save', localSlide.value)
  emit('update:open', false)
}

const handleSaveQuestion = () => {
  if (!localQuestion.value || !questionValid.value) return
  emit('save', localQuestion.value)
  emit('update:open', false)
}
</script>

