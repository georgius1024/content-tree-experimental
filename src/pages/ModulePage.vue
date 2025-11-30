<template>
  <div class="flex flex-col bg-white">
    <!-- Header -->
    <header class="border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
      <div class="min-w-0">
        <h1 class="text-sm font-medium truncate">{{ moduleData.meta.title }}</h1>
        <p v-if="moduleData.meta.description" class="mt-1 text-xs text-gray-600 truncate" v-html="moduleData.meta.description" />
      </div>
      <span class="text-xs text-gray-600 shrink-0 ml-4">
        {{ t('module.progress', { current: progressCurrent, total: linearSteps.length }) }}
      </span>
    </header>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto p-6">
      <div v-if="isDone" class="max-w-3xl mx-auto">
        <div
          class="rounded-lg p-6 border"
          :class="hasErrors ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'"
        >
          <h2
            class="text-base font-semibold"
            :class="hasErrors ? 'text-red-900' : 'text-green-900'"
          >
            {{ hasErrors ? t('module.failTitle') : t('module.congratsTitle') }}
          </h2>
          <p
            class="mt-2 text-sm"
            :class="hasErrors ? 'text-red-800' : 'text-green-800'"
          >
            {{ hasErrors ? t('module.failText') : t('module.congratsText') }}
          </p>
          <div v-if="hasErrors" class="mt-4">
            <p class="text-sm font-medium text-red-900 mb-2">
              {{ t('module.errorsHeading') }}
            </p>
            <ul class="space-y-1">
              <li
                v-for="(err, idx) in errors"
                :key="`${err.stepId}-${idx}`"
                class="text-sm text-red-800"
              >
                • {{ err.stepName }} — {{ err.message }}
              </li>
            </ul>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
              @click="onRetry"
            >
              {{ t('module.tryAgain') }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="current">
        <div class="max-w-3xl mx-auto">
          <!-- Slide -->
          <div v-if="current.type === 'slide'" class="space-y-4">
            <h2 v-if="current.name" class="text-lg font-semibold text-gray-900">
              {{ current.name || t('module.slide') }}
            </h2>
            <RichTextView :content="current.content" />
          </div>

          <!-- Question -->
          <div v-else-if="current.type === 'question'" class="space-y-4">
            <h2 v-if="current.name" class="text-lg font-semibold text-gray-900">
              {{ current.name || t('module.question') }}
            </h2>
            <RichTextView :content="current.slide" />

            <p class="text-xs font-semibold text-gray-600">
              {{ questionInstruction }}
            </p>

            <ul class="mt-4 space-y-2">
              <li v-for="(option, index) in current.options" :key="index">
                <button
                  type="button"
                  class="w-full text-left px-4 py-3 rounded-lg border-2 transition-all"
                  :class="getOptionClass(index)"
                  :disabled="isLocked"
                  @click="onSelectOption(index)"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="inline-flex items-center justify-center text-xs font-semibold shrink-0 transition-colors w-6 h-6 rounded-full border"
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

            <div v-if="!isLocked" class="mt-4 flex justify-end">
              <button
                type="button"
                class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!canSubmit"
                @click="onSubmit"
              >
                {{ t('module.submitButton') }}
              </button>
            </div>

            <div v-if="isLocked" class="mt-4 p-3 rounded-lg" :class="getFeedbackClass()">
              <span class="text-sm font-medium">
                {{ isAnswerCorrect ? t('coursePreview.feedbackCorrect') : t('coursePreview.feedbackIncorrect') }}
              </span>
            </div>
          </div>

          <!-- Case (test-case player) -->
          <div v-else-if="current.type === 'case'" class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ current.title }}
            </h2>
            <div v-if="current.description" class="text-sm text-gray-700" v-html="current.description" />

            <div v-if="activeCaseNode" class="mt-4 space-y-3">
              <div
                class="rounded-lg border p-4"
                :class="activeCaseNode.success === 'success'
                  ? 'bg-green-50 border-green-200'
                  : activeCaseNode.success === 'fail'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'"
              >
                <h3 class="text-base font-semibold"
                  :class="activeCaseNode.success === 'success'
                    ? 'text-green-900'
                    : activeCaseNode.success === 'fail'
                      ? 'text-red-900'
                      : 'text-gray-900'"
                >
                  {{ activeCaseNode.title }}
                </h3>
                <div v-if="activeCaseNode.description" class="mt-2 text-sm"
                  :class="activeCaseNode.success === 'success'
                    ? 'text-green-800'
                    : activeCaseNode.success === 'fail'
                      ? 'text-red-800'
                      : 'text-gray-700'"
                  v-html="activeCaseNode.description"
                />
              </div>

              <!-- Failure controls: show only restart button -->
              <div v-if="activeCaseNode.success === 'fail'">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  @click="restartCase"
                >
                  {{ t('module.caseRestart') }}
                </button>
              </div>

              <div v-if="activeCaseNode.children && activeCaseNode.children.length > 0" class="flex flex-col gap-2">
                <button
                  v-for="edge in activeCaseNode.children"
                  :key="edge.id"
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-left"
                  @click="onCaseGo(edge.id)"
                >
                  {{ edge.label ?? t('module.nextButton') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Video -->
          <div v-else-if="current.type === 'video'" class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ current.title || t('module.video') }}
            </h2>
            <div class="video-container">
              <iframe
                :src="youtubeEmbedUrl(current.youtubeId)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="w-full aspect-video rounded-lg"
              />
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                @click="markWatched"
                :disabled="watched"
              >
                {{ watched ? t('module.watched') : t('module.markWatched') }}
              </button>
              <span v-if="current.duration" class="text-xs text-gray-600">
                {{ current.duration }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer navigation -->
    <footer v-if="!isDone" class="border-t border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 bg-gray-50">
      <button
        type="button"
        class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canGoPrev"
        @click="onPrev"
      >
        {{ t('module.backButton') }}
      </button>
      <button
        type="button"
        class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canGoNext"
        @click="onNext"
      >
        {{ t('module.nextButton') }}
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import RichTextView from '../components/RichTextView.vue'
import moduleJson from '../data/next-bank-module.json'
import type { Module, ModuleStep, VideoStep, CaseStep, CaseNode } from '../types'

const { t } = useI18n()

// Load module data
const moduleData = moduleJson as Module

// Build steps (include case) and place case before questions
const stepsRaw = (moduleData.steps ?? []) as ModuleStep[]
const nonQuestionsExceptCase = stepsRaw.filter(s => s.type !== 'question' && s.type !== 'case')
const caseSteps = stepsRaw.filter(s => s.type === 'case')
const questionSteps = stepsRaw.filter(s => s.type === 'question')
// Case after slides/video and before questions
const linearSteps = [...nonQuestionsExceptCase, ...caseSteps, ...questionSteps] as ModuleStep[]

const position = ref(0)
const isDone = computed(() => position.value >= linearSteps.length)
const current = computed<ModuleStep | null>(() => (isDone.value ? null : linearSteps[position.value] ?? null))
const progressCurrent = computed(() => Math.min(position.value + 1, linearSteps.length))

// Case state (per current step)
const caseNodeId = ref<string | null>(null)
const activeCaseNode = computed<CaseNode | null>(() => {
  if (current.value?.type !== 'case') return null
  const step = current.value as CaseStep
  const startId = step.nodes[0]?.id ?? null
  const id = caseNodeId.value ?? startId
  return step.nodes.find(n => n.id === id) ?? (startId ? step.nodes.find(n => n.id === startId) ?? null : null)
})

watch(current, (step) => {
  if (step?.type === 'case') {
    const s = step as CaseStep
    caseNodeId.value = s.nodes[0]?.id ?? null
  } else {
    caseNodeId.value = null
  }
})

const onCaseGo = (nextId: string) => {
  if (current.value?.type !== 'case') return
  caseNodeId.value = nextId
}

const restartCase = () => {
  if (current.value?.type !== 'case') return
  const step = current.value as CaseStep
  caseNodeId.value = step.nodes[0]?.id ?? null
}

// Errors tracking
type ModuleError = { stepId: string; stepName: string; message: string }
const errors = ref<ModuleError[]>([])
const hasErrors = computed(() => errors.value.length > 0)

// Video state
const watched = computed(() => current.value?.type === 'video' ? Boolean(videoWatched.value[(current.value as VideoStep).id]) : false)
const videoWatched = ref<Record<string, boolean>>({})
const markWatched = () => {
  if (current.value?.type !== 'video') return
  const id = (current.value as VideoStep).id
  // Replace object immutably to trigger reactivity
  videoWatched.value = { ...videoWatched.value, [id]: true }
  // Auto-advance to the next step after marking as watched
  if (position.value < linearSteps.length) {
    position.value += 1
  }
}
const youtubeEmbedUrl = (id: string) => `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`

// Question state
const selected = ref<number[]>([])
const submitted = ref(false)
const isLocked = computed(() => submitted.value)
const canSubmit = computed(() => current.value?.type === 'question' ? selected.value.length > 0 && !submitted.value : false)
const isAnswerCorrect = computed(() => {
  if (current.value?.type !== 'question') return false
  const correct = current.value.inputRule.correctOptions.slice().sort()
  const picked = selected.value.slice().sort()
  if (current.value.inputRule.type === 'single') {
    return picked.length === 1 && correct.length === 1 && picked[0] === correct[0]
  }
  if (current.value.inputRule.type === 'multiple') {
    if (correct.length !== picked.length) return false
    return correct.every((v, i) => v === picked[i])
  }
  return false
})

const questionInstruction = computed(() => {
  if (current.value?.type !== 'question') return ''
  return current.value.inputRule.type === 'single'
    ? t('coursePreview.instructionSingle')
    : t('coursePreview.instructionMultiple')
})

const isCorrectOption = (index: number): boolean => {
  if (current.value?.type !== 'question') return false
  return current.value.inputRule.correctOptions.includes(index)
}

const getOptionClass = (index: number): string => {
  if (current.value?.type !== 'question') return 'border-gray-200 hover:border-gray-300'
  const isSelected = selected.value.includes(index)
  const locked = isLocked.value
  const correct = isCorrectOption(index)

  if (locked) {
    if (isSelected && correct) return 'border-green-500 bg-green-50'
    if (isSelected && !correct) return 'border-red-500 bg-red-50'
    if (!isSelected && correct) return 'border-green-200 bg-green-50/30'
    return 'border-gray-200 bg-gray-50'
  }
  if (isSelected) return 'border-blue-500 bg-blue-50'
  return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
}

const getOptionNumberClass = (index: number): string => {
  if (current.value?.type !== 'question') {
    return 'bg-gray-100 text-gray-600 border-transparent'
  }
  const isSelected = selected.value.includes(index)
  const locked = isLocked.value
  const correct = isCorrectOption(index)

  if (locked) {
    if (isSelected && correct) return 'bg-green-600 text-white border-green-600'
    if (isSelected && !correct) return 'bg-red-600 text-white border-red-600'
    if (!isSelected && correct) return 'bg-green-50 text-green-800 border-green-200'
    return 'bg-gray-200 text-gray-600 border-gray-200'
  }
  if (isSelected) return 'bg-blue-600 text-white border-blue-600'
  return 'bg-gray-100 text-gray-600 border-transparent'
}

const getFeedbackClass = (): string => {
  return isAnswerCorrect.value ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
}

const onSelectOption = (index: number) => {
  if (submitted.value || current.value?.type !== 'question') return
  if (current.value.inputRule.type === 'single') {
    selected.value = [index]
  } else {
    const set = new Set(selected.value)
    set.has(index) ? set.delete(index) : set.add(index)
    selected.value = Array.from(set).sort((a, b) => a - b)
  }
}

const onSubmit = () => {
  if (!canSubmit.value) return
  submitted.value = true
  // Record error if incorrect
  if (current.value?.type === 'question' && !isAnswerCorrect.value) {
    errors.value = [
      ...errors.value,
      {
        stepId: current.value.id,
        stepName: current.value.name || t('module.question'),
        message: t('module.incorrectAnswer'),
      },
    ]
  }
}

// Navigation
const canGoPrev = computed(() => position.value > 0)
const canGoNext = computed(() => {
  const step = current.value
  if (!step) return false
  if (step.type === 'slide') return true
  if (step.type === 'video') return (step.required ? watched.value : true)
  if (step.type === 'question') return submitted.value
  if (step.type === 'case') {
    // Only allow Next on success, not on fail
    return activeCaseNode.value?.success === 'success'
  }
  return false
})

const onNext = () => {
  if (!canGoNext.value) return
  // reset question state when leaving a question
  if (current.value?.type === 'question') {
    selected.value = []
    submitted.value = false
  }
  // reset case state when leaving case
  if (current.value?.type === 'case') {
    caseNodeId.value = null
  }
  position.value += 1
}

const onPrev = () => {
  if (!canGoPrev.value) return
  position.value -= 1
  // reset question state for new position
  selected.value = []
  submitted.value = false
  caseNodeId.value = null
}

const onRetry = () => {
  position.value = 0
  selected.value = []
  submitted.value = false
  videoWatched.value = {}
  errors.value = []
}
</script>

<style scoped>
.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}
.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

