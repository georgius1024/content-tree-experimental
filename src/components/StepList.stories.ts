import type { Meta, StoryObj } from '@storybook/vue3'
import StepList from './StepList.vue'
import SlideEditor from './SlideEditor.vue'
import QuestionEditor from './QuestionEditor.vue'
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X } from 'lucide-vue-next'
import i18n from '../i18n'
import type { Step, Slide, Question } from '../types'

const meta = {
  title: 'Content/StepList',
  component: StepList,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<story />',
      setup() {
        // Ensure i18n is available
        return {}
      }
    })
  ]
} satisfies Meta<typeof StepList>

export default meta
type Story = StoryObj<typeof meta>

const createSlide = (name: string, content: string): Slide => ({
  id: `slide-${Math.random().toString(36).substr(2, 9)}`,
  type: 'slide',
  name,
  content,
})

const createQuestion = (
  name: string,
  slide: string,
  options: string[],
  inputRuleType: 'single' | 'multiple' = 'single',
  correctOptions: number[] = []
): Question => ({
  id: `question-${Math.random().toString(36).substr(2, 9)}`,
  type: 'question',
  name,
  slide,
  options,
  inputRule: {
    type: inputRuleType,
    correctOptions
  }
})

export const Empty: Story = {
  args: {} as any,
  render: () => ({
    components: { 
      StepList, 
      SlideEditor, 
      QuestionEditor,
      Dialog, 
      DialogPanel, 
      DialogTitle, 
      TransitionRoot, 
      TransitionChild,
      X
    },
    setup() {
      const t = (key: string) => {
        return i18n.global.t(key)
      }
      
      const steps = ref<Step[]>([])
      const sectionId = 'section-1'
      const isModalOpen = ref(false)
      const editingStep = ref<Step | null>(null)
      const isEditingSlide = computed(() => editingStep.value?.type === 'slide')
      const isEditingQuestion = computed(() => editingStep.value?.type === 'question')
      const isCreating = ref(false)
      const stepToDelete = ref<Step | null>(null)
      const isDeleteConfirmOpen = ref(false)
      
      const localSlide = ref<Slide | null>(null)
      const localQuestion = ref<Question | null>(null)
      const questionValid = ref(false)
      
      const openCreateSlide = () => {
        localSlide.value = createSlide('', '')
        editingStep.value = localSlide.value
        isCreating.value = true
        isModalOpen.value = true
      }
      
      const openCreateQuestion = () => {
        localQuestion.value = createQuestion('', '', ['', ''], 'single', [])
        editingStep.value = localQuestion.value
        isCreating.value = true
        isModalOpen.value = true
        questionValid.value = false
      }
      
      const openEditSlide = ({ stepId }: { stepId: string }) => {
        const step = steps.value.find(s => s.id === stepId)
        if (step && step.type === 'slide') {
          // Create a fresh copy to ensure reactivity
          localSlide.value = {
            id: step.id,
            type: step.type,
            name: step.name,
            content: step.content
          }
          editingStep.value = localSlide.value
          isCreating.value = false
          isModalOpen.value = true
        }
      }
      
      const openEditQuestion = ({ stepId }: { stepId: string }) => {
        const step = steps.value.find(s => s.id === stepId)
        if (step && step.type === 'question') {
          // Create a fresh copy to ensure reactivity
          localQuestion.value = {
            id: step.id,
            type: step.type,
            name: step.name,
            slide: step.slide,
            options: [...step.options],
            inputRule: {
              type: step.inputRule.type,
              correctOptions: [...step.inputRule.correctOptions]
            }
          }
          editingStep.value = localQuestion.value
          isCreating.value = false
          isModalOpen.value = true
          questionValid.value = true
        }
      }
      
      const updateSlide = (updatedSlide: Slide) => {
        localSlide.value = updatedSlide
      }
      
      const updateQuestion = (updatedQuestion: Question) => {
        localQuestion.value = updatedQuestion
      }
      
      const saveSlide = () => {
        if (!localSlide.value) return
        
        if (isCreating.value) {
          steps.value = [...steps.value, localSlide.value]
        } else {
          const index = steps.value.findIndex(s => s.id === localSlide.value!.id)
          if (index !== -1) {
            steps.value = [
              ...steps.value.slice(0, index),
              localSlide.value,
              ...steps.value.slice(index + 1)
            ]
          }
        }
        
        closeModal()
      }
      
      const saveQuestion = () => {
        if (!localQuestion.value || !questionValid.value) return
        
        if (isCreating.value) {
          steps.value = [...steps.value, localQuestion.value]
        } else {
          const index = steps.value.findIndex(s => s.id === localQuestion.value!.id)
          if (index !== -1) {
            steps.value = [
              ...steps.value.slice(0, index),
              localQuestion.value,
              ...steps.value.slice(index + 1)
            ]
          }
        }
        
        closeModal()
      }
      
      const closeModal = () => {
        isModalOpen.value = false
        editingStep.value = null
        localSlide.value = null
        localQuestion.value = null
        isCreating.value = false
        questionValid.value = false
      }
      
      const handleDeleteStep = ({ stepId }: { stepId: string }) => {
        const step = steps.value.find(s => s.id === stepId)
        if (step) {
          stepToDelete.value = step
          isDeleteConfirmOpen.value = true
        }
      }
      
      const confirmDelete = () => {
        if (!stepToDelete.value) return
        steps.value = steps.value.filter(s => s.id !== stepToDelete.value!.id)
        stepToDelete.value = null
        isDeleteConfirmOpen.value = false
      }
      
      const cancelDelete = () => {
        stepToDelete.value = null
        isDeleteConfirmOpen.value = false
      }
      
      const handleReorderSteps = ({ newOrder }: { newOrder: string[] }) => {
        const stepMap = new Map(steps.value.map(s => [s.id, s]))
        steps.value = newOrder.map(id => stepMap.get(id)!).filter(Boolean)
      }
      
      const slideEditorKey = computed(() => {
        return localSlide.value ? `slide-${localSlide.value.id}-${isModalOpen.value}` : 'new-slide'
      })
      
      const questionEditorKey = computed(() => {
        return localQuestion.value ? `question-${localQuestion.value.id}-${isModalOpen.value}` : 'new-question'
      })
      
      return {
        t,
        steps,
        sectionId,
        isModalOpen,
        editingStep,
        isEditingSlide,
        isEditingQuestion,
        localSlide,
        localQuestion,
        questionValid,
        isDeleteConfirmOpen,
        stepToDelete,
        slideEditorKey,
        questionEditorKey,
        openCreateSlide,
        openCreateQuestion,
        openEditSlide,
        openEditQuestion,
        updateSlide,
        updateQuestion,
        saveSlide,
        saveQuestion,
        closeModal,
        handleDeleteStep,
        handleReorderSteps,
        confirmDelete,
        cancelDelete
      }
    },
    template: `
      <div class="max-w-4xl p-4">
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Section: Empty Section</h2>
          <StepList
            :steps="steps"
            :section-id="sectionId"
            @add-slide="openCreateSlide"
            @add-question="openCreateQuestion"
            @edit-slide="openEditSlide"
            @edit-question="openEditQuestion"
            @delete-step="handleDeleteStep"
            @reorder-steps="handleReorderSteps"
          />
        </div>
        
        <!-- Step Editor Modal -->
        <TransitionRoot :show="isModalOpen" as="template">
          <Dialog :open="isModalOpen" @close="closeModal" class="relative z-50">
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
                      {{ isCreating ? 'Create' : 'Edit' }} {{ isEditingSlide ? 'Slide' : 'Question' }}
                    </DialogTitle>
                    <button
                      type="button"
                      class="rounded p-1 hover:bg-gray-100"
                      @click="closeModal"
                    >
                      <X :size="20" class="text-gray-500" />
                    </button>
                  </div>
                  
                  <div class="p-6 overflow-y-auto flex-1">
                    <SlideEditor
                      v-if="isEditingSlide && localSlide"
                      :key="slideEditorKey"
                      :model-value="localSlide"
                      @update:model-value="updateSlide"
                    />
                    <QuestionEditor
                      v-if="isEditingQuestion && localQuestion"
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
                      @click="closeModal"
                    >
                      {{ t('common.cancel') }}
                    </button>
                    <button
                      v-if="isEditingSlide"
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      @click="saveSlide"
                    >
                      {{ t('common.save') }}
                    </button>
                    <button
                      v-if="isEditingQuestion"
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!questionValid"
                      @click="saveQuestion"
                    >
                      {{ t('common.save') }}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </TransitionRoot>
        
        <!-- Delete Confirmation Modal -->
        <TransitionRoot :show="isDeleteConfirmOpen" as="template">
          <Dialog :open="isDeleteConfirmOpen" @close="cancelDelete" class="relative z-50">
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
                <DialogPanel class="w-full max-w-md bg-white rounded-lg shadow-xl">
                  <div class="p-6">
                    <DialogTitle class="text-lg font-semibold mb-2">
                      Delete Step?
                    </DialogTitle>
                    <p class="text-sm text-gray-600 mb-4">
                      Are you sure you want to delete "{{ stepToDelete?.name || 'this step' }}"? This action cannot be undone.
                    </p>
                    <div class="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        @click="cancelDelete"
                      >
                        {{ t('common.cancel') }}
                      </button>
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        @click="confirmDelete"
                      >
                        {{ t('common.delete') }}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </TransitionRoot>
        
        <div class="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 class="text-sm font-semibold mb-2">Steps Data ({{ steps.length }}):</h3>
          <pre class="text-xs overflow-auto max-h-64">{{ JSON.stringify(steps.map(s => ({ id: s.id, type: s.type, name: s.name })), null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

export const WithSteps: Story = {
  args: {} as any,
  render: () => ({
    components: { 
      StepList, 
      SlideEditor, 
      QuestionEditor,
      Dialog,
      DialogPanel,
      DialogTitle,
      TransitionRoot,
      TransitionChild,
      X
    },
    setup() {
      // Use i18n instance directly if useI18n doesn't work in Storybook
      const t = (key: string) => {
        return i18n.global.t(key)
      }
      
      const steps = ref<Step[]>([
        createSlide('Introduction', '<p>Welcome to the course. This is an introduction slide.</p>'),
        createQuestion(
          'What is Vue?', 
          '<p>Select the correct answer:</p>', 
          ['A framework', 'A library', 'A programming language'], 
          'single', 
          [0]
        ),
        createSlide('Conclusion', '<p>Thank you for learning with us!</p>'),
        createQuestion(
          'Which are true?', 
          '<p>Select all correct answers:</p>', 
          ['Vue is reactive', 'Vue uses virtual DOM', 'Vue is a backend framework'], 
          'multiple', 
          [0, 1]
        ),
      ])
      
      const sectionId = 'section-1'
      const isModalOpen = ref(false)
      const editingStep = ref<Step | null>(null)
      const isEditingSlide = computed(() => editingStep.value?.type === 'slide')
      const isEditingQuestion = computed(() => editingStep.value?.type === 'question')
      const isCreating = ref(false)
      const stepToDelete = ref<Step | null>(null)
      const isDeleteConfirmOpen = ref(false)
      
      const localSlide = ref<Slide | null>(null)
      const localQuestion = ref<Question | null>(null)
      const questionValid = ref(false)
      
      const openCreateSlide = () => {
        localSlide.value = createSlide('', '')
        editingStep.value = localSlide.value
        isCreating.value = true
        isModalOpen.value = true
      }
      
      const openCreateQuestion = () => {
        localQuestion.value = createQuestion('', '', ['', ''], 'single', [])
        editingStep.value = localQuestion.value
        isCreating.value = true
        isModalOpen.value = true
        questionValid.value = false
      }
      
      const openEditSlide = ({ stepId }: { stepId: string }) => {
        const step = steps.value.find(s => s.id === stepId)
        if (step && step.type === 'slide') {
          // Create a fresh copy to ensure reactivity
          localSlide.value = {
            id: step.id,
            type: step.type,
            name: step.name,
            content: step.content
          }
          editingStep.value = localSlide.value
          isCreating.value = false
          isModalOpen.value = true
        }
      }
      
      const openEditQuestion = ({ stepId }: { stepId: string }) => {
        const step = steps.value.find(s => s.id === stepId)
        if (step && step.type === 'question') {
          // Create a fresh copy to ensure reactivity
          localQuestion.value = {
            id: step.id,
            type: step.type,
            name: step.name,
            slide: step.slide,
            options: [...step.options],
            inputRule: {
              type: step.inputRule.type,
              correctOptions: [...step.inputRule.correctOptions]
            }
          }
          editingStep.value = localQuestion.value
          isCreating.value = false
          isModalOpen.value = true
          questionValid.value = true
        }
      }
      
      const updateSlide = (updatedSlide: Slide) => {
        localSlide.value = updatedSlide
      }
      
      const updateQuestion = (updatedQuestion: Question) => {
        localQuestion.value = updatedQuestion
      }
      
      const saveSlide = () => {
        if (!localSlide.value) return
        
        if (isCreating.value) {
          steps.value = [...steps.value, localSlide.value]
        } else {
          const index = steps.value.findIndex(s => s.id === localSlide.value!.id)
          if (index !== -1) {
            steps.value = [
              ...steps.value.slice(0, index),
              localSlide.value,
              ...steps.value.slice(index + 1)
            ]
          }
        }
        
        closeModal()
      }
      
      const saveQuestion = () => {
        if (!localQuestion.value || !questionValid.value) return
        
        if (isCreating.value) {
          steps.value = [...steps.value, localQuestion.value]
        } else {
          const index = steps.value.findIndex(s => s.id === localQuestion.value!.id)
          if (index !== -1) {
            steps.value = [
              ...steps.value.slice(0, index),
              localQuestion.value,
              ...steps.value.slice(index + 1)
            ]
          }
        }
        
        closeModal()
      }
      
      const closeModal = () => {
        isModalOpen.value = false
        editingStep.value = null
        localSlide.value = null
        localQuestion.value = null
        isCreating.value = false
        questionValid.value = false
      }
      
      const confirmDelete = () => {
        if (!stepToDelete.value) return
        
        steps.value = steps.value.filter(s => s.id !== stepToDelete.value!.id)
        stepToDelete.value = null
        isDeleteConfirmOpen.value = false
      }
      
      const cancelDelete = () => {
        stepToDelete.value = null
        isDeleteConfirmOpen.value = false
      }
      
      const handleDeleteStep = ({ stepId }: { stepId: string }) => {
        const step = steps.value.find(s => s.id === stepId)
        if (step) {
          stepToDelete.value = step
          isDeleteConfirmOpen.value = true
        }
      }
      
      const handleReorderSteps = ({ newOrder }: { newOrder: string[] }) => {
        const stepMap = new Map(steps.value.map(s => [s.id, s]))
        steps.value = newOrder.map(id => stepMap.get(id)!).filter(Boolean)
      }
      
      const slideEditorKey = computed(() => {
        return localSlide.value ? `slide-${localSlide.value.id}-${isModalOpen.value}` : 'new-slide'
      })
      
      const questionEditorKey = computed(() => {
        return localQuestion.value ? `question-${localQuestion.value.id}-${isModalOpen.value}` : 'new-question'
      })
      
      return {
        t,
        steps,
        sectionId,
        isModalOpen,
        editingStep,
        isEditingSlide,
        isEditingQuestion,
        localSlide,
        localQuestion,
        questionValid,
        isDeleteConfirmOpen,
        stepToDelete,
        slideEditorKey,
        questionEditorKey,
        openCreateSlide,
        openCreateQuestion,
        openEditSlide,
        openEditQuestion,
        updateSlide,
        updateQuestion,
        saveSlide,
        saveQuestion,
        closeModal,
        handleDeleteStep,
        handleReorderSteps,
        confirmDelete,
        cancelDelete
      }
    },
    template: `
      <div class="max-w-4xl p-4">
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Section: Introduction to Vue.js</h2>
          <StepList
            :steps="steps"
            :section-id="sectionId"
            @add-slide="openCreateSlide"
            @add-question="openCreateQuestion"
            @edit-slide="openEditSlide"
            @edit-question="openEditQuestion"
            @delete-step="handleDeleteStep"
            @reorder-steps="handleReorderSteps"
          />
        </div>
        
        <!-- Step Editor Modal -->
        <TransitionRoot :show="isModalOpen" as="template">
          <Dialog :open="isModalOpen" @close="closeModal" class="relative z-50">
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
                      {{ isCreating ? 'Create' : 'Edit' }} {{ isEditingSlide ? 'Slide' : 'Question' }}
                    </DialogTitle>
                    <button
                      type="button"
                      class="rounded p-1 hover:bg-gray-100"
                      @click="closeModal"
                    >
                      <X :size="20" class="text-gray-500" />
                    </button>
                  </div>
                  <div class="p-6 overflow-y-auto flex-1">
                    <SlideEditor
                      v-if="isEditingSlide && localSlide"
                      :key="slideEditorKey"
                      :model-value="localSlide"
                      @update:model-value="updateSlide"
                    />
                    <QuestionEditor
                      v-if="isEditingQuestion && localQuestion"
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
                      @click="closeModal"
                    >
                      {{ t('common.cancel') }}
                    </button>
                    <button
                      v-if="isEditingSlide"
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      @click="saveSlide"
                    >
                      {{ t('common.save') }}
                    </button>
                    <button
                      v-if="isEditingQuestion"
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!questionValid"
                      @click="saveQuestion"
                    >
                      {{ t('common.save') }}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </TransitionRoot>
        
        <!-- Delete Confirmation Modal -->
        <TransitionRoot :show="isDeleteConfirmOpen" as="template">
          <Dialog :open="isDeleteConfirmOpen" @close="cancelDelete" class="relative z-50">
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
                <DialogPanel class="w-full max-w-md bg-white rounded-lg shadow-xl">
                  <div class="p-6">
                    <DialogTitle class="text-lg font-semibold mb-2">
                      Delete Step?
                    </DialogTitle>
                    <p class="text-sm text-gray-600 mb-4">
                      Are you sure you want to delete "{{ stepToDelete?.name || 'this step' }}"? This action cannot be undone.
                    </p>
                    <div class="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        @click="cancelDelete"
                      >
                        {{ t('common.cancel') }}
                      </button>
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        @click="confirmDelete"
                      >
                        {{ t('common.delete') }}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </TransitionRoot>
        
        <!-- Debug Info -->
        <div class="mt-8 p-4 bg-gray-100 rounded-md">
          <h3 class="text-sm font-semibold mb-2">Steps Data ({{ steps.length }}):</h3>
          <pre class="text-xs overflow-auto max-h-64">{{ JSON.stringify(steps.map(s => ({ id: s.id, type: s.type, name: s.name })), null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

export const ReadOnly: Story = {
  args: {} as any,
  render: () => ({
    components: { StepList },
    setup() {
      const steps = ref<Step[]>([
        createSlide('Introduction', '<p>Welcome to the course</p>'),
        createQuestion('What is Vue?', '<p>Select the correct answer:</p>', ['Framework', 'Library', 'Language'], 'single', [0]),
        createSlide('Conclusion', '<p>Thank you for learning</p>'),
      ])
      const sectionId = 'section-1'
      
      return {
        steps,
        sectionId
      }
    },
    template: `
      <div class="max-w-2xl p-4">
        <StepList
          :steps="steps"
          :section-id="sectionId"
          :readonly="true"
        />
      </div>
    `,
  }),
}


