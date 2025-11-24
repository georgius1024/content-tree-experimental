<template>
  <div class="flex flex-col bg-white">
    <!-- Header -->
    <header class="border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
      <h1 class="text-sm font-medium truncate">{{ courseTitle }}</h1>
      <span class="text-xs text-gray-600 shrink-0 ml-4">
        {{ progressLabel }}
      </span>
    </header>

    <!-- Main content area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar navigation -->
      <aside class="w-60 border-r border-gray-200 overflow-y-auto shrink-0">
        <nav class="p-2 space-y-3">
          <div v-for="section in structure" :key="section.id" class="space-y-1">
            <div class="px-2 text-xs font-semibold text-gray-700 flex items-center justify-between">
              <span class="truncate">{{ section.name }}</span>
              <span class="text-[10px] text-gray-500 shrink-0 ml-2">{{ section.steps.length }}</span>
            </div>
            <ul class="space-y-0.5">
              <li
                v-for="(step, stepIndex) in section.steps"
                :key="step.id"
                class="px-2 py-1 text-xs rounded cursor-pointer transition-colors"
                :class="getStepNavClass(section.id, step.id, getGlobalIndex(section.id, stepIndex))"
                @click="onGotoStep(section.id, stepIndex)"
              >
                <span class="truncate block">
                  {{ step.name || t(step.type === 'slide' ? 'coursePreview.slideFallback' : 'coursePreview.questionFallback') }}
                </span>
              </li>
            </ul>
          </div>
          <div class="pt-3 mt-3 border-t border-gray-100">
            <div
              class="transition-colors"
              :class="getFinalNavClass()"
              @click="onGotoFinalReport"
            >
              {{ t('coursePreview.finalReportNav') }}
            </div>
          </div>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div v-if="isViewingResults && finalResults" class="max-w-3xl mx-auto">
          <div class="border border-gray-200 rounded-lg bg-gray-50 p-5">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-base font-semibold text-gray-900">
                  {{ t('coursePreview.finalReportHeading') }}
                </h2>
                <p class="text-sm text-gray-600">
                  {{
                    t('coursePreview.finalReportSummary', {
                      correct: finalResults.totalCorrect,
                      total: finalResults.totalQuestions,
                      accuracy: formatPercent(finalResults.totalAccuracy),
                    })
                  }}
                </p>
              </div>
              <span class="text-sm font-semibold text-gray-900">
                {{ formatPercent(finalResults.totalAccuracy) }}
              </span>
            </div>
            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <div
                v-for="sectionResult in finalResults.bySection"
                :key="sectionResult.section.id"
                class="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ sectionResult.section.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{
                      t('coursePreview.sectionCorrectSummary', {
                        correct: sectionResult.correct,
                        total: sectionResult.questions,
                      })
                    }}
                  </p>
                </div>
                <span class="text-sm font-semibold text-gray-900">
                  {{ formatPercent(sectionResult.accuracy) }}
                </span>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
                @click="onRetry"
              >
                {{ t('coursePreview.tryAgainButton') }}
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="current" class="max-w-3xl mx-auto">
          <!-- Slide content -->
          <div v-if="current.step.type === 'slide'" class="space-y-4">
            <h2 v-if="current.step.name" class="text-lg font-semibold text-gray-900">
              {{ current.step.name }}
            </h2>
            <RichTextView :content="current.step.content" />
          </div>

          <!-- Question content -->
          <div v-else class="space-y-4">
            <h2 v-if="current.step.name" class="text-lg font-semibold text-gray-900">
              {{ current.step.name }}
            </h2>
            <RichTextView :content="current.step.slide" />

            <p class="text-xs font-semibold text-gray-600">
              {{ getQuestionInstruction() }}
            </p>

            <!-- Custom option controls -->
            <ul class="mt-4 space-y-2">
              <li v-for="(option, index) in current.step.options" :key="index">
                <button
                  type="button"
                  class="w-full text-left px-4 py-3 rounded-lg border-2 transition-all"
                  :class="getOptionClass(index)"
                  :disabled="isLocked"
                  @click="onSelectOption(index)"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="inline-flex items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                      :class="getOptionNumberClass(index)"
                    >
                      {{ index + 1 }}
                    </span>
                    <span class="text-sm text-gray-900 flex-1">{{ option }}</span>
                    <span
                      v-if="isLocked && isCorrectOption(index)"
                      class="text-green-600 shrink-0"
                      aria-label="Correct answer"
                    >
                      ✓
                    </span>
                  </div>
                </button>
              </li>
            </ul>

            <div
              v-if="!isLocked"
              class="mt-4 flex justify-end"
            >
              <button
                type="button"
                class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!canSubmit"
                @click="onSubmit"
              >
                {{ t('coursePreview.submitButton') }}
              </button>
            </div>

            <!-- Feedback after submission -->
            <div v-if="isLocked" class="mt-4 p-3 rounded-lg" :class="getFeedbackClass()">
              <span class="text-sm font-medium">
                {{
                  current.answer?.score === 1
                    ? t('coursePreview.feedbackCorrect')
                    : t('coursePreview.feedbackIncorrect')
                }}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Bottom navigation bar -->
    <footer class="border-t border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 bg-gray-50">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canGoPrev"
          @click="onPrev"
        >
          {{ t('coursePreview.backButton') }}
        </button>
        <span class="text-xs text-gray-600">
          {{ progressLabel }}
        </span>
      </div>
      <div>
        <button
          type="button"
          class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isViewingResults || (!canGoNext && !canShowFinalViaNext)"
          @click="onNext"
        >
          {{ t('coursePreview.nextButton') }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CONTENT_FOREST, getForest } from '../services/tree'
import { getCourse } from '../services/courses'
import {
  initPreview,
  currentStep,
  isLocked as isStepLocked,
  canPrev,
  canNext,
  canSubmit as canSubmitStep,
  prev,
  next,
  submitAnswer,
  setAnswer1ofN,
  setAnswerMofN,
  goto,
  results,
  loadPreviewState,
  persistPreviewState,
  clearPreviewState,
} from '../services/preview'
import type { Course, Section, PreviewState } from '../types'
import RichTextView from '../components/RichTextView.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const forestId = CONTENT_FOREST
const courseTitle = ref('')
const course = ref<Course | null>(null)
const structure = ref<Section[]>([])
const preview = ref<PreviewState | null>(null)
const visitedUntil = ref(0)
const isViewingResults = ref(false)
const persistState = () => {
  if (!course.value || !preview.value) return
  persistPreviewState(course.value.id, preview.value)
}
const deriveVisitedIndex = (state: PreviewState | null): number => {
  if (!state) return 0
  const answeredMax = state.steps.reduce(
    (max, step) => (step.answer ? Math.max(max, step.globalIndex) : max),
    -1
  )
  return Math.max(0, answeredMax, state.position)
}

// Computed properties
const current = computed(() => (preview.value ? currentStep(preview.value) : null))
const currentPosition = computed(() => preview.value?.position ?? 0)
const totalSteps = computed(() => preview.value?.steps.length ?? 0)
const isSlide = computed(() => current.value?.step.type === 'slide')
const isLocked = computed(() => current.value ? isStepLocked(current.value) : false)
const canGoPrev = computed(() => preview.value ? canPrev(preview.value) : false)
const canGoNext = computed(() => preview.value ? canNext(preview.value) : false)
const canSubmit = computed(() => preview.value ? canSubmitStep(preview.value) : false)
const isAtLastStep = computed(() => {
  if (!preview.value || preview.value.steps.length === 0) return false
  return preview.value.position === preview.value.steps.length - 1
})
const isFinalReportUnlocked = computed(() => {
  if (!preview.value) return false
  const hasQuestions = preview.value.steps.some((step) => step.step.type === 'question')
  if (!hasQuestions) return false
  return preview.value.steps.every(
    (step) => step.step.type !== 'question' || Boolean(step.answer?.submittedAt)
  )
})
const canShowFinalViaNext = computed(
  () => isFinalReportUnlocked.value && isAtLastStep.value && !isViewingResults.value
)
const finalResults = computed(() => {
  if (!isFinalReportUnlocked.value || !preview.value) return null
  return results(preview.value)
})
const progressLabel = computed(() =>
  isViewingResults.value
    ? t('coursePreview.finalReportLabel')
    : t('coursePreview.progress', {
        current: (currentPosition.value ?? 0) + 1,
        total: totalSteps.value ?? 0,
      })
)

const formatPercent = (value: number): string => `${Math.round((value ?? 0) * 100)}%`

// Track visited steps
watch(currentPosition, (pos) => {
  visitedUntil.value = Math.max(visitedUntil.value, pos)
})

const isVisited = (globalIndex: number): boolean => globalIndex <= visitedUntil.value

const getGlobalIndex = (sectionId: string, stepIndex: number): number => {
  if (!preview.value) return -1
  return preview.value.steps.findIndex(
    (s: { section: { id: string }; stepIndex: number }) => s.section.id === sectionId && s.stepIndex === stepIndex
  )
}

const getQuestionInstruction = (): string => {
  if (!current.value || current.value.step.type !== 'question') {
    return t('coursePreview.instructionDefault')
  }
  return current.value.step.inputRule.type === 'single'
    ? t('coursePreview.instructionSingle')
    : t('coursePreview.instructionMultiple')
}

const getStepNavClass = (sectionId: string, stepId: string, globalIndex: number): string => {
  if (!current.value) return 'text-gray-600 hover:bg-gray-50'
  const isCurrent = current.value.section.id === sectionId && current.value.step.id === stepId
  const visited = isVisited(globalIndex)
  if (isViewingResults.value) {
    return visited ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 opacity-60 cursor-not-allowed'
  }
  
  if (isCurrent) {
    return 'bg-blue-50 text-blue-700 font-medium'
  }
  if (visited) {
    return 'text-gray-700 hover:bg-gray-50'
  }
  return 'text-gray-400 opacity-60 cursor-not-allowed'
}

const onGotoStep = (sectionId: string, stepIndex: number) => {
  if (!preview.value) return
  isViewingResults.value = false
  const globalIndex = getGlobalIndex(sectionId, stepIndex)
  if (globalIndex < 0 || !isVisited(globalIndex)) return
  preview.value = goto(preview.value, globalIndex)
  persistState()
}

const onSelectOption = (index: number) => {
  if (!preview.value || !current.value || isLocked.value) return
  if (current.value.step.type !== 'question') return

  let nextState: PreviewState | null = null
  if (current.value.step.inputRule.type === 'single') {
    nextState = setAnswer1ofN(preview.value, index)
  } else {
    const selected = new Set(current.value.answer?.selected ?? [])
    if (selected.has(index)) {
      selected.delete(index)
    } else {
      selected.add(index)
    }
    nextState = setAnswerMofN(preview.value, [...selected])
  }
  if (nextState) {
    preview.value = nextState
    persistState()
  }
}

const getOptionClass = (index: number): string => {
  if (!current.value || current.value.step.type !== 'question') return 'border-gray-200 hover:border-gray-300'
  
  const selected = current.value.answer?.selected ?? []
  const isSelected = selected.includes(index)
  const locked = isLocked.value
  const isCorrect = isCorrectOption(index)

  if (locked) {
    if (isSelected && isCorrect) {
      return 'border-green-500 bg-green-50'
    }
    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50'
    }
    if (!isSelected && isCorrect) {
      return 'border-green-200 bg-green-50/30'
    }
    return 'border-gray-200 bg-gray-50'
  }

  if (isSelected) {
    return 'border-blue-500 bg-blue-50'
  }
  return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
}

const getOptionNumberClass = (index: number): string => {
  if (!current.value || current.value.step.type !== 'question') {
    return 'w-6 h-6 rounded-full border bg-gray-100 text-gray-600 border-transparent'
  }

  const { step } = current.value
  const isMultiple = step.inputRule.type === 'multiple'
  const baseShape = isMultiple
    ? 'w-6 h-6 rounded-md border'
    : 'w-6 h-6 rounded-full border'

  const applyClass = (bg: string, text: string, border: string) =>
    `${baseShape} ${bg} ${text} ${border}`

  const selected = current.value.answer?.selected ?? []
  const isSelected = selected.includes(index)
  const locked = isLocked.value
  const isCorrect = isCorrectOption(index)

  if (locked) {
    if (isSelected && isCorrect) {
      return applyClass('bg-green-600', 'text-white', 'border-green-600')
    }
    if (isSelected && !isCorrect) {
      return applyClass('bg-red-600', 'text-white', 'border-red-600')
    }
    if (!isSelected && isCorrect) {
      return applyClass('bg-green-50', 'text-green-800', 'border-green-200')
    }
    return applyClass('bg-gray-200', 'text-gray-600', 'border-gray-200')
  }

  if (isSelected) {
    return applyClass('bg-blue-600', 'text-white', 'border-blue-600')
  } else {
    return applyClass('bg-gray-100', 'text-gray-600', 'border-transparent')
  }
}

const isCorrectOption = (index: number): boolean => {
  if (!current.value || current.value.step.type !== 'question') return false
  return current.value.step.inputRule.correctOptions.includes(index)
}

const getFeedbackClass = (): string => {
  if (!current.value?.answer) return 'bg-gray-100'
  return current.value.answer.score === 1 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
}

const onPrev = () => {
  if (!preview.value || !canGoPrev.value) return
  isViewingResults.value = false
  preview.value = prev(preview.value)
  persistState()
}

const onNext = () => {
  if (!preview.value) return
  if (canShowFinalViaNext.value) {
    isViewingResults.value = true
    return
  }
  if (!canGoNext.value) return
  isViewingResults.value = false
  preview.value = next(preview.value)
  persistState()
}

const onSubmit = () => {
  if (!preview.value || !canSubmit.value) return
  isViewingResults.value = false
  preview.value = submitAnswer(preview.value)
  persistState()
}

const onGotoFinalReport = () => {
  if (!isFinalReportUnlocked.value) return
  isViewingResults.value = true
}

const getFinalNavClass = (): string => {
  if (!isFinalReportUnlocked.value) {
    return 'px-2 py-1 text-xs rounded text-gray-400 opacity-60 cursor-not-allowed'
  }
  if (isViewingResults.value) {
    return 'px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 font-medium'
  }
  return 'px-2 py-1 text-xs rounded text-gray-700 hover:bg-gray-50 cursor-pointer'
}

const onRetry = () => {
  if (!course.value) return
  clearPreviewState(course.value.id)
  preview.value = initPreview(course.value)
  visitedUntil.value = 0
  isViewingResults.value = false
  persistState()
}

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  if (isViewingResults.value || !current.value) return

  // Enter: submit/next
  if (e.key === 'Enter') {
    e.preventDefault()
    if (!isSlide.value && !isLocked.value) {
      onSubmit()
    } else {
      onNext()
    }
    return
  }

  // Escape: go back
  if (e.key === 'Escape') {
    e.preventDefault()
    onPrev()
    return
  }

  // 1-9: select option
  const digit = Number(e.key)
  if (digit >= 1 && digit <= 9 && current.value.step.type === 'question') {
    const index = digit - 1
    if (index < current.value.step.options.length) {
      onSelectOption(index)
    }
  }
}

onMounted(async () => {
  // Load course
  const forest = await getForest(forestId)
  const rawPath = (route.params.path as string) || ''
  const pagePath = rawPath.endsWith('/') ? `/${rawPath}` : `/${rawPath}/`

  const getNodeIdFromPath = (path: string): number | null => {
    const ids = path.split('/').filter(Boolean).map((s) => Number(s)).filter(Number.isFinite)
    const lastId = ids.length > 0 ? ids[ids.length - 1] : undefined
    return lastId != null ? lastId : null
  }

  const nodeId = getNodeIdFromPath(pagePath)
  const node = nodeId != null
    ? forest.find((n) => n.id === nodeId && n.deletedAt === null)
    : null

  if (!node || node.type !== 'leaf') {
    router.push({ path: '/' })
    return
  }

  courseTitle.value = node.name
  const cid = typeof node.objectId === 'string' ? node.objectId : null
  if (cid) {
    const c = getCourse(cid)
    if (c && c.deletedAt === null) {
      course.value = c
      courseTitle.value = c.fullName || node.name
      structure.value = c.structure || []
      preview.value = loadPreviewState(c)
      visitedUntil.value = deriveVisitedIndex(preview.value)
      isViewingResults.value = isFinalReportUnlocked.value
      persistState()
    } else {
      router.push({ path: `/course${pagePath}` })
      return
    }
  } else {
    router.push({ path: `/course${pagePath}` })
    return
  }

  // Setup keyboard listeners
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
