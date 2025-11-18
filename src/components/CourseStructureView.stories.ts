import type { Meta, StoryObj } from '@storybook/vue3'
import CourseStructureView from './CourseStructureView.vue'
import SectionEditorModal from './SectionEditorModal.vue'
import SlideEditor from './SlideEditor.vue'
import QuestionEditor from './QuestionEditor.vue'
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X } from 'lucide-vue-next'
import i18n from '../i18n'
import type { Section, Step, Slide, Question } from '../types'

const meta = {
  title: 'Content/CourseStructureView',
  component: CourseStructureView,
  tags: ['autodocs'],
} satisfies Meta<typeof CourseStructureView>

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

const createSection = (name: string, steps: Step[] = []): Section => ({
  id: `section-${Math.random().toString(36).substr(2, 9)}`,
  name,
  steps
})

export const Default: Story = {
  args: {} as any,
  render: () => ({
    components: {
      CourseStructureView,
      SectionEditorModal,
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

      const structure = ref<Section[]>([
        createSection('Introduction', [
          createSlide('Welcome', '<p>Welcome to the course!</p>'),
          createQuestion('What is this?', '<p>Select the correct answer:</p>', ['Option A', 'Option B', 'Option C'], 'single', [0])
        ]),
        createSection('Main Content', [
          createSlide('Overview', '<p>This is the main content section.</p>'),
          createSlide('Details', '<p>Here are the details.</p>'),
          createQuestion('Test your knowledge', '<p>Select all correct:</p>', ['True', 'False', 'Maybe'], 'multiple', [0, 2])
        ]),
        createSection('Conclusion', [
          createSlide('Summary', '<p>Thank you for learning!</p>')
        ])
      ])

      // Section Editor Modal
      const isSectionModalOpen = ref(false)
      const editingSection = ref<Section | null>(null)
      const isCreatingSection = ref(false)

      // Step Editor Modal
      const isStepModalOpen = ref(false)
      const editingStep = ref<Step | null>(null)
      const stepType = ref<'slide' | 'question'>('slide')
      const currentSectionId = ref<string | null>(null)

      // Delete confirmation
      const sectionToDelete = ref<Section | null>(null)
      const isDeleteSectionOpen = ref(false)
      const stepToDelete = ref<{ sectionId: string; stepId: string } | null>(null)
      const isDeleteStepOpen = ref(false)

      // Step editor state
      const localSlide = ref<Slide | null>(null)
      const localQuestion = ref<Question | null>(null)
      const questionValid = ref(false)

      const slideEditorKey = computed(() => {
        return localSlide.value ? `slide-${localSlide.value.id}-${isStepModalOpen.value}` : 'new-slide'
      })

      const questionEditorKey = computed(() => {
        return localQuestion.value ? `question-${localQuestion.value.id}-${isStepModalOpen.value}` : 'new-question'
      })

      // Section CRUD
      const handleAddSection = () => {
        editingSection.value = null
        isCreatingSection.value = true
        isSectionModalOpen.value = true
      }

      const handleEditSectionName = ({ sectionId }: { sectionId: string }) => {
        const section = structure.value.find(s => s.id === sectionId)
        if (section) {
          editingSection.value = section
          isCreatingSection.value = false
          isSectionModalOpen.value = true
        }
      }

      const handleSaveSection = (section: Section) => {
        if (isCreatingSection.value) {
          structure.value = [...structure.value, section]
        } else {
          const index = structure.value.findIndex(s => s.id === section.id)
          if (index !== -1) {
            structure.value = [
              ...structure.value.slice(0, index),
              section,
              ...structure.value.slice(index + 1)
            ]
          }
        }
        isSectionModalOpen.value = false
        editingSection.value = null
      }

      const handleDeleteSection = ({ sectionId }: { sectionId: string }) => {
        const section = structure.value.find(s => s.id === sectionId)
        if (section) {
          sectionToDelete.value = section
          isDeleteSectionOpen.value = true
        }
      }

      const confirmDeleteSection = () => {
        if (!sectionToDelete.value) return
        structure.value = structure.value.filter(s => s.id !== sectionToDelete.value!.id)
        sectionToDelete.value = null
        isDeleteSectionOpen.value = false
      }

      const cancelDeleteSection = () => {
        sectionToDelete.value = null
        isDeleteSectionOpen.value = false
      }

      // Step CRUD
      const handleAddSlide = ({ sectionId }: { sectionId: string }) => {
        currentSectionId.value = sectionId
        editingStep.value = null
        stepType.value = 'slide'
        isStepModalOpen.value = true
        localSlide.value = createSlide('', '')
        localQuestion.value = null
      }

      const handleAddQuestion = ({ sectionId }: { sectionId: string }) => {
        currentSectionId.value = sectionId
        editingStep.value = null
        stepType.value = 'question'
        isStepModalOpen.value = true
        localQuestion.value = createQuestion('', '', ['', ''], 'single', [])
        localSlide.value = null
        questionValid.value = false
      }

      const handleEditSlide = ({ sectionId, stepId }: { sectionId: string; stepId: string }) => {
        const section = structure.value.find(s => s.id === sectionId)
        const step = section?.steps.find(s => s.id === stepId)
        if (step && step.type === 'slide') {
          currentSectionId.value = sectionId
          editingStep.value = step
          stepType.value = 'slide'
          isStepModalOpen.value = true
          localSlide.value = {
            id: step.id,
            type: step.type,
            name: step.name,
            content: step.content
          }
          localQuestion.value = null
        }
      }

      const handleEditQuestion = ({ sectionId, stepId }: { sectionId: string; stepId: string }) => {
        const section = structure.value.find(s => s.id === sectionId)
        const step = section?.steps.find(s => s.id === stepId)
        if (step && step.type === 'question') {
          currentSectionId.value = sectionId
          editingStep.value = step
          stepType.value = 'question'
          isStepModalOpen.value = true
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
          localSlide.value = null
          questionValid.value = true
        }
      }

      const handleDeleteStep = ({ sectionId, stepId }: { sectionId: string; stepId: string }) => {
        stepToDelete.value = { sectionId, stepId }
        isDeleteStepOpen.value = true
      }

      const confirmDeleteStep = () => {
        if (!stepToDelete.value) return
        const section = structure.value.find(s => s.id === stepToDelete.value!.sectionId)
        if (section) {
          const updatedSection: Section = {
            ...section,
            steps: section.steps.filter(s => s.id !== stepToDelete.value!.stepId)
          }
          const index = structure.value.findIndex(s => s.id === section.id)
          structure.value = [
            ...structure.value.slice(0, index),
            updatedSection,
            ...structure.value.slice(index + 1)
          ]
        }
        stepToDelete.value = null
        isDeleteStepOpen.value = false
      }

      const cancelDeleteStep = () => {
        stepToDelete.value = null
        isDeleteStepOpen.value = false
      }

      const updateSlide = (updatedSlide: Slide) => {
        localSlide.value = updatedSlide
      }

      const updateQuestion = (updatedQuestion: Question) => {
        localQuestion.value = updatedQuestion
      }

      const handleSaveStep = (step: Step) => {
        if (!currentSectionId.value) return
        
        const section = structure.value.find(s => s.id === currentSectionId.value)
        if (!section) return

        const stepIndex = section.steps.findIndex(s => s.id === step.id)
        const updatedSection: Section = {
          ...section,
          steps: stepIndex !== -1
            ? [
                ...section.steps.slice(0, stepIndex),
                step,
                ...section.steps.slice(stepIndex + 1)
              ]
            : [...section.steps, step]
        }

        const sectionIndex = structure.value.findIndex(s => s.id === section.id)
        structure.value = [
          ...structure.value.slice(0, sectionIndex),
          updatedSection,
          ...structure.value.slice(sectionIndex + 1)
        ]

        isStepModalOpen.value = false
        editingStep.value = null
        localSlide.value = null
        localQuestion.value = null
        currentSectionId.value = null
      }

      const handleUpdateStructure = (updatedStructure: Section[]) => {
        structure.value = updatedStructure
      }

      const handleCloseStepModal = () => {
        isStepModalOpen.value = false
        editingStep.value = null
        localSlide.value = null
        localQuestion.value = null
        currentSectionId.value = null
        questionValid.value = false
      }

      return {
        t,
        structure,
        isSectionModalOpen,
        editingSection,
        isCreatingSection,
        isStepModalOpen,
        editingStep,
        stepType,
        localSlide,
        localQuestion,
        questionValid,
        slideEditorKey,
        questionEditorKey,
        isDeleteSectionOpen,
        sectionToDelete,
        isDeleteStepOpen,
        stepToDelete,
        handleAddSection,
        handleEditSectionName,
        handleSaveSection,
        handleDeleteSection,
        confirmDeleteSection,
        cancelDeleteSection,
        handleAddSlide,
        handleAddQuestion,
        handleEditSlide,
        handleEditQuestion,
        handleDeleteStep,
        confirmDeleteStep,
        cancelDeleteStep,
        updateSlide,
        updateQuestion,
        handleSaveStep,
        handleUpdateStructure,
        handleCloseStepModal
      }
    },
    template: `
      <div class="max-w-4xl p-4">
        <div class="mb-4">
          <h2 class="text-lg font-semibold mb-2">Course Structure</h2>
          <CourseStructureView
            :structure="structure"
            @update:structure="handleUpdateStructure"
            @add-section="handleAddSection"
            @edit-section-name="handleEditSectionName"
            @delete-section="handleDeleteSection"
            @add-slide="handleAddSlide"
            @add-question="handleAddQuestion"
            @edit-slide="handleEditSlide"
            @edit-question="handleEditQuestion"
            @delete-step="handleDeleteStep"
          />
        </div>

        <!-- Section Editor Modal -->
        <SectionEditorModal
          :section="editingSection"
          :open="isSectionModalOpen"
          @update:open="isSectionModalOpen = $event"
          @save="handleSaveSection"
        />

        <!-- Step Editor Modal -->
        <TransitionRoot :show="isStepModalOpen" as="template">
          <Dialog :open="isStepModalOpen" @close="handleCloseStepModal" class="relative z-60">
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
                      {{ editingStep ? t('stepEditorModal.editTitle') : t('stepEditorModal.createTitle') }}
                      {{ stepType === 'slide' ? t('stepEditorModal.slide') : t('stepEditorModal.question') }}
                    </DialogTitle>
                    <button
                      type="button"
                      class="rounded p-1 hover:bg-gray-100"
                      @click="handleCloseStepModal"
                    >
                      <X :size="20" class="text-gray-500" />
                    </button>
                  </div>

                  <div class="p-6 overflow-y-auto flex-1">
                    <SlideEditor
                      v-if="stepType === 'slide' && localSlide"
                      :key="slideEditorKey"
                      :model-value="localSlide"
                      @update:model-value="updateSlide"
                    />
                    <QuestionEditor
                      v-if="stepType === 'question' && localQuestion"
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
                      @click="handleCloseStepModal"
                    >
                      {{ t('common.cancel') }}
                    </button>
                    <button
                      v-if="stepType === 'slide'"
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      @click="handleSaveStep(localSlide)"
                    >
                      {{ t('common.save') }}
                    </button>
                    <button
                      v-if="stepType === 'question'"
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!questionValid"
                      @click="handleSaveStep(localQuestion)"
                    >
                      {{ t('common.save') }}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </TransitionRoot>

        <!-- Delete Section Confirmation Modal -->
        <TransitionRoot :show="isDeleteSectionOpen" as="template">
          <Dialog :open="isDeleteSectionOpen" @close="cancelDeleteSection" class="relative z-50">
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
                      Delete Section?
                    </DialogTitle>
                    <p class="text-sm text-gray-600 mb-4">
                      Are you sure you want to delete "{{ sectionToDelete?.name || 'this section' }}"? This will also delete all steps in this section. This action cannot be undone.
                    </p>
                    <div class="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        @click="cancelDeleteSection"
                      >
                        {{ t('common.cancel') }}
                      </button>
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        @click="confirmDeleteSection"
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

        <!-- Delete Step Confirmation Modal -->
        <TransitionRoot :show="isDeleteStepOpen" as="template">
          <Dialog :open="isDeleteStepOpen" @close="cancelDeleteStep" class="relative z-50">
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
                      Are you sure you want to delete this step? This action cannot be undone.
                    </p>
                    <div class="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        @click="cancelDeleteStep"
                      >
                        {{ t('common.cancel') }}
                      </button>
                      <button
                        type="button"
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        @click="confirmDeleteStep"
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
          <h3 class="text-sm font-semibold mb-2">Course Structure ({{ structure.length }} sections):</h3>
          <pre class="text-xs overflow-auto max-h-64">{{ JSON.stringify(structure.map(s => ({ id: s.id, name: s.name, steps: s.steps.length })), null, 2) }}</pre>
        </div>
      </div>
    `,
  }),
}

