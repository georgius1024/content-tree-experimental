import type {
  Course,
  Section,
  Step,
  PreviewState,
  PreviewStep,
  PreviewAnswer,
  PreviewResults,
  SectionSummary,
} from '../types'

const nowIso = (): string => new Date().toISOString()
const storageKey = (courseId: string): string => `preview-state:${courseId}`
const getStorage = (): Storage | null =>
  typeof window !== 'undefined' && window.localStorage ? window.localStorage : null

const isQuestionStep = (step: Step): step is Extract<Step, { type: 'question' }> =>
  step.type === 'question'

const buildSteps = (sections: Section[]): readonly PreviewStep[] => {
  const steps: PreviewStep[] = []
  sections.forEach((section, sectionIndex) => {
    section.steps.forEach((step, stepIndex) => {
      steps.push({
        section,
        step,
        sectionIndex,
        stepIndex,
        globalIndex: steps.length,
      })
    })
  })
  return steps
}

const answersMatch = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((x) => b.includes(x))

const evaluateScore = (step: Extract<Step, { type: 'question' }>, selected: readonly number[]): number => {
  if (step.inputRule.type === 'single') {
    const correct = step.inputRule.correctOptions[0]
    return selected.length === 1 && selected[0] === correct ? 1 : 0
  }
  return answersMatch([...selected].sort(), [...step.inputRule.correctOptions].sort()) ? 1 : 0
}

const updateStep = (
  state: PreviewState,
  index: number,
  updater: (step: PreviewStep) => PreviewStep
): PreviewState => {
  const updatedSteps = state.steps.map((s, i) => (i === index ? updater(s) : s))
  return { steps: updatedSteps, position: state.position }
}

// PUBLIC API

export const initPreview = (course: Course): PreviewState => {
  const steps = buildSteps(course.structure)
  return { steps, position: 0 }
}

export const currentStep = (state: PreviewState): PreviewStep | null =>
  state.steps[state.position] ?? null

export const isLocked = (step: PreviewStep): boolean =>
  Boolean(step.answer?.submittedAt)

export const canSubmit = (state: PreviewState): boolean => {
  const current = currentStep(state)
  if (!current || !isQuestionStep(current.step)) return false
  if (isLocked(current)) return false
  const selected = current.answer?.selected ?? []
  return selected.length > 0
}

export const submitAnswer = (state: PreviewState): PreviewState => {
  const current = currentStep(state)
  if (!current || !isQuestionStep(current.step) || isLocked(current)) return state

  const selected = current.answer?.selected ?? []
  const score = evaluateScore(current.step, selected)
  const answer: PreviewAnswer = { selected: [...selected], score, submittedAt: nowIso() }

  return updateStep(state, state.position, (step) => ({ ...step, answer }))
}

export const setAnswer1ofN = (state: PreviewState, optionIndex: number): PreviewState => {
  const current = currentStep(state)
  if (!current || !isQuestionStep(current.step) || isLocked(current)) return state
  const answer: PreviewAnswer = { selected: [optionIndex], score: 0, submittedAt: '' }
  return updateStep(state, state.position, (step) => ({ ...step, answer }))
}

export const setAnswerMofN = (state: PreviewState, optionIndexes: number[]): PreviewState => {
  const current = currentStep(state)
  if (!current || !isQuestionStep(current.step) || isLocked(current)) return state
  if (current.step.inputRule.type !== 'multiple') return state

  // normalize indices: finite numbers, unique, sorted
  const uniqueSorted = Array.from(
    new Set(
      (optionIndexes ?? []).filter((i) => Number.isFinite(i)).map((i) => Number(i))
    )
  ).sort((a, b) => a - b)

  const answer: PreviewAnswer = { selected: uniqueSorted, score: 0, submittedAt: '' }
  return updateStep(state, state.position, (step) => ({ ...step, answer }))
}

export const canPrev = (state: PreviewState): boolean => state.position > 0

export const canNext = (state: PreviewState): boolean => {
  if (state.position >= state.steps.length - 1) return false
  const current = currentStep(state)
  if (!current) return false
  if (!isQuestionStep(current.step)) return true
  return isLocked(current)
}

export const prev = (state: PreviewState): PreviewState =>
  canPrev(state) ? { ...state, position: state.position - 1 } : state

export const next = (state: PreviewState): PreviewState =>
  canNext(state) ? { ...state, position: state.position + 1 } : state

export const goto = (state: PreviewState, index: number): PreviewState => {
  const clamped = Math.max(0, Math.min(index, state.steps.length - 1))
  return { ...state, position: clamped }
}

export const progress = (state: PreviewState): number =>
  state.steps.length === 0 ? 0 : (state.position + 1) / state.steps.length

export const results = (state: PreviewState): PreviewResults => {
  const bySection = new Map<string, { section: Section; questions: number; correct: number }>()
  state.steps.forEach((previewStep) => {
    if (!bySection.has(previewStep.section.id)) {
      bySection.set(previewStep.section.id, {
        section: previewStep.section,
        questions: 0,
        correct: 0,
      })
    }
    if (isQuestionStep(previewStep.step)) {
      const record = bySection.get(previewStep.section.id)!
      record.questions += 1
      record.correct += previewStep.answer?.score === 1 ? 1 : 0
    }
  })
  const sectionList: SectionSummary[] = [...bySection.values()].map((summary) => ({
    ...summary,
    accuracy: summary.questions === 0 ? 0 : summary.correct / summary.questions,
  }))

  const totalQuestions = sectionList.reduce((acc, s) => acc + s.questions, 0)
  const totalCorrect = sectionList.reduce((acc, s) => acc + s.correct, 0)
  const totalAccuracy = totalQuestions === 0 ? 0 : totalCorrect / totalQuestions

  return { totalQuestions, totalCorrect, totalAccuracy, bySection: sectionList }
}

export const selectedOf = (state: PreviewState): readonly number[] => {
  const current = currentStep(state)
  return current?.answer?.selected ?? []
}

// Persistence helpers
type StoredPreview = {
  position: number
  answers: Array<{
    stepId: string
    selected: number[]
    score: number
    submittedAt: string
  }>
}

const applyStoredAnswers = (state: PreviewState, stored: StoredPreview | null): PreviewState => {
  if (!stored) return state
  const stepIndexById = new Map<string, number>(
    state.steps.map((previewStep, index) => [previewStep.step.id, index] as const)
  )

  stored.answers.forEach((answer) => {
    const index = stepIndexById.get(answer.stepId)
    if (index == null) return
    const previewStep = state.steps[index]
    if (!previewStep) {
      return
    }
    if (!isQuestionStep(previewStep.step)) return
    const selected = Array.isArray(answer.selected)
      ? answer.selected.filter((n) => Number.isFinite(n)).map((n) => Number(n))
      : []
    const normalized =
      previewStep.step.inputRule.type === 'multiple'
        ? Array.from(new Set(selected)).sort((a, b) => a - b)
        : selected.slice(0, 1)
    const persistedAnswer: PreviewAnswer = {
      selected: normalized,
      score: Number.isFinite(answer.score) ? answer.score : 0,
      submittedAt: typeof answer.submittedAt === 'string' ? answer.submittedAt : '',
    }
    state = updateStep(state, index, (step) => ({ ...step, answer: persistedAnswer }))
  })

  const clampedPosition = Math.max(0, Math.min(stored.position ?? 0, state.steps.length - 1))
  return { ...state, position: clampedPosition }
}

export const loadPreviewState = (course: Course): PreviewState => {
  const base = initPreview(course)
  const storage = getStorage()
  if (!storage) return base
  const raw = storage.getItem(storageKey(course.id))
  if (!raw) return base
  try {
    const parsed = JSON.parse(raw) as StoredPreview
    return applyStoredAnswers(base, parsed)
  } catch {
    return base
  }
}

export const persistPreviewState = (courseId: string, state: PreviewState): void => {
  const storage = getStorage()
  if (!storage) return
  const answers = state.steps
    .filter((step) => isQuestionStep(step.step) && step.answer)
    .map((step) => ({
      stepId: step.step.id,
      selected: [...(step.answer?.selected ?? [])],
      score: step.answer?.score ?? 0,
      submittedAt: step.answer?.submittedAt ?? '',
    }))
  const payload: StoredPreview = {
    position: state.position,
    answers,
  }
  storage.setItem(storageKey(courseId), JSON.stringify(payload))
}

export const clearPreviewState = (courseId: string): void => {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(storageKey(courseId))
}

