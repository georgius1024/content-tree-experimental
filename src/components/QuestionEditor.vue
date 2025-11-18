<template>
  <div class="space-y-4">
    <!-- Name input -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('questionEditor.name') }}
        <span class="text-red-500">*</span>
      </label>
      <input
        :model-value="localQuestion.name"
        type="text"
        :readonly="props.readonly"
        :disabled="props.readonly"
        :class="[
          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
          validationErrors.name 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500',
          props.readonly ? 'bg-gray-50 cursor-not-allowed' : ''
        ]"
        :placeholder="t('questionEditor.namePlaceholder')"
        @input="updateName(($event.target as HTMLInputElement).value)"
      />
      <p v-if="validationErrors.name" class="mt-1 text-xs text-red-500">
        {{ validationErrors.name }}
      </p>
    </div>

    <!-- Question text (rich text editor) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('questionEditor.questionText') }}</label>
      <RichTextEditor
        :model-value="localQuestion.slide"
        :placeholder="t('questionEditor.questionTextPlaceholder')"
        :readonly="props.readonly"
        @update:model-value="updateSlide"
      />
    </div>

    <!-- Input rule type selector -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('questionEditor.inputRule') }}</label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2" :class="props.readonly ? '' : 'cursor-pointer'">
          <input
            type="radio"
            :checked="localQuestion.inputRule.type === 'single'"
            :disabled="props.readonly"
            class="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            @change="updateRuleType('single')"
          />
          <span class="text-sm text-gray-700">{{ t('questionEditor.singleChoice') }}</span>
        </label>
        <label class="flex items-center gap-2" :class="props.readonly ? '' : 'cursor-pointer'">
          <input
            type="radio"
            :checked="localQuestion.inputRule.type === 'multiple'"
            :disabled="props.readonly"
            class="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            @change="updateRuleType('multiple')"
          />
          <span class="text-sm text-gray-700">{{ t('questionEditor.multipleChoice') }}</span>
        </label>
      </div>
    </div>

    <!-- Answers section -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t('questionEditor.options') }}
        <span class="text-red-500">*</span>
      </label>
      <div 
        :class="[
          'border rounded-md p-3 space-y-2',
          validationErrors.options ? 'border-red-500' : 'border-gray-300'
        ]"
      >
        <Draggable
          v-model="localOptions"
          item-key="id"
          tag="div"
          class="space-y-6"
          :animation="200"
          :disabled="props.readonly"
          :handle="props.readonly ? '' : '.drag-handle'"
          @change="onOptionsReorder"
        >
          <div
            v-for="(option, index) in localOptions"
            :key="option.id"
            class="relative flex items-center gap-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <!-- Drag handle -->
            <button
              v-if="!props.readonly"
              type="button"
              class="drag-handle text-gray-400 cursor-move hover:text-gray-600 shrink-0 flex items-center"
              :title="t('common.drag')"
            >
              <GripVertical :size="18" />
            </button>

            <!-- Correct answer indicator -->
            <div class="shrink-0 flex items-center">
              <input
                v-if="localQuestion.inputRule.type === 'single'"
                type="radio"
                :checked="localQuestion.inputRule.correctOptions.includes(index)"
                :disabled="props.readonly || !option.text.trim()"
                class="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                :name="`correct-${localQuestion.id}`"
                @change="toggleCorrect(index)"
              />
              <input
                v-else
                type="checkbox"
                :checked="localQuestion.inputRule.correctOptions.includes(index)"
                :disabled="props.readonly || !option.text.trim()"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                @change="toggleCorrect(index)"
              />
            </div>

            <!-- Option text input -->
            <div class="flex-1 flex items-center">
              <input
                v-model="option.text"
                type="text"
                :readonly="props.readonly"
                :disabled="props.readonly"
                :class="[
                  'w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1',
                  validationErrors.optionTexts?.[index]
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500',
                  props.readonly ? 'bg-gray-50 cursor-not-allowed' : ''
                ]"
                :placeholder="t('questionEditor.optionPlaceholder')"
                @input="syncOptionToQuestion(index)"
              />
            </div>
            
            <!-- Option error message (below the row) -->
            <div v-if="validationErrors.optionTexts?.[index]" class="absolute -bottom-5 left-0 right-0">
              <p class="text-xs text-red-500">
                {{ validationErrors.optionTexts[index] }}
              </p>
            </div>

            <!-- Delete button -->
            <button
              type="button"
              :disabled="props.readonly || localQuestion.options.length <= 2"
              class="shrink-0 p-1 text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="props.readonly ? '' : 'hover:text-red-600'"
              :title="props.readonly ? '' : t('common.delete')"
              @click="removeOption(index)"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </Draggable>

        <!-- Add option button -->
        <button
          v-if="!props.readonly"
          type="button"
          class="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 border-dashed rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
          @click="addOption"
        >
          + {{ t('questionEditor.addOption') }}
        </button>
        
        <!-- Error for minimum options -->
        <p v-if="validationErrors.options" class="text-xs text-red-500">
          {{ validationErrors.options }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'
import { GripVertical, Trash2 } from 'lucide-vue-next'
import type { Question, InputRuleType } from '../types'
import RichTextEditor from './RichTextEditor.vue'

const { t } = useI18n()

type Props = {
  modelValue: Question
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [question: Question]
  'update:valid': [isValid: boolean]
}>()

const localQuestion = computed({
  get(): Question {
    return props.modelValue
  },
  set(value: Question) {
    emit('update:modelValue', value)
  }
})

type OptionItem = {
  id: number
  text: string
}

const localOptions = ref<OptionItem[]>([])

watch(
  () => props.modelValue.options,
  (options) => {
    localOptions.value = options.map((text, index) => ({
      id: index,
      text
    }))
  },
  { immediate: true }
)

// Validation computed properties
const validationErrors = computed(() => {
  const errors: {
    name?: string
    options?: string
    optionTexts?: Record<number, string>
  } = {}

  // Name required
  if (!localQuestion.value.name.trim()) {
    errors.name = t('questionEditor.validation.nameRequired')
  }

  // At least 2 options required
  if (localQuestion.value.options.length < 2) {
    errors.options = t('questionEditor.validation.minOptionsRequired')
  }

  // All options must be non-empty
  const optionErrors: Record<number, string> = {}
  localQuestion.value.options.forEach((option, index) => {
    if (!option.trim()) {
      optionErrors[index] = t('questionEditor.validation.optionRequired')
    }
  })
  if (Object.keys(optionErrors).length > 0) {
    errors.optionTexts = optionErrors
  }

  return errors
})

const isValid = computed(() => {
  return Object.keys(validationErrors.value).length === 0
})

// Emit validation state changes
watch(
  () => isValid.value,
  (newIsValid) => {
    emit('update:valid', newIsValid)
  },
  { immediate: true }
)

const onOptionsReorder = (evt: { moved?: { oldIndex: number; newIndex: number } }) => {
  if (!evt.moved) {
    // Re-sync in case of no-op
    localOptions.value = props.modelValue.options.map((text, index) => ({
      id: index,
      text
    }))
    return
  }

  const { oldIndex, newIndex } = evt.moved
  
  // Build new options array with reordered items
  const newOptions = [...props.modelValue.options]
  const movedOption = newOptions[oldIndex]
  if (movedOption === undefined) {
    return
  }
  newOptions.splice(oldIndex, 1)
  newOptions.splice(newIndex, 0, movedOption)

  // Build mapping: oldIndex -> newIndex
  // After reordering, find where each original option ended up
  const indexMap = new Map<number, number>()
  props.modelValue.options.forEach((oldOption, oldIdx) => {
    const newIdx = newOptions.indexOf(oldOption)
    if (newIdx !== -1) {
      indexMap.set(oldIdx, newIdx)
    }
  })

  // Remap correctOptions from old indices to new indices
  const remappedCorrectOptions = props.modelValue.inputRule.correctOptions
    .map(oldIdx => indexMap.get(oldIdx))
    .filter((newIdx): newIdx is number => typeof newIdx === 'number')
    .sort((a, b) => a - b)

  localQuestion.value = {
    ...localQuestion.value,
    options: newOptions,
    inputRule: {
      ...localQuestion.value.inputRule,
      correctOptions: remappedCorrectOptions
    }
  }
  
  // Update localOptions to reflect the new order
  localOptions.value = newOptions.map((text, index) => ({
    id: index,
    text
  }))
}

const updateName = (name: string) => {
  localQuestion.value = {
    ...localQuestion.value,
    name
  }
}

const updateSlide = (slide: string) => {
  localQuestion.value = {
    ...localQuestion.value,
    slide
  }
}

const updateRuleType = (type: InputRuleType) => {
  const currentCorrectOptions = localQuestion.value.inputRule.correctOptions
  let newCorrectOptions: number[] = currentCorrectOptions

  if (type === 'single') {
    // Keep only the first correct option, or empty array if none
    const firstOption = currentCorrectOptions[0]
    newCorrectOptions = firstOption !== undefined ? [firstOption] : []
  }

  localQuestion.value = {
    ...localQuestion.value,
    inputRule: {
      type,
      correctOptions: newCorrectOptions
    }
  }
}

const addOption = () => {
  const newOptions = [...localQuestion.value.options, '']
  localQuestion.value = {
    ...localQuestion.value,
    options: newOptions
  }
  // Update localOptions immediately
  localOptions.value = newOptions.map((text, index) => ({
    id: index,
    text
  }))
}

const syncOptionToQuestion = (index: number) => {
  // Sync from localOptions to localQuestion
  const option = localOptions.value[index]
  if (!option) return
  
  const text = option.text
  const newOptions = [...localQuestion.value.options]
  newOptions[index] = text
  localQuestion.value = {
    ...localQuestion.value,
    options: newOptions
  }
}

const removeOption = (index: number) => {
  if (localQuestion.value.options.length <= 2) {
    return
  }

  const newOptions = localQuestion.value.options.filter((_, i) => i !== index)
  const newCorrectOptions = localQuestion.value.inputRule.correctOptions
    .filter(optIndex => optIndex !== index)
    .map(optIndex => optIndex > index ? optIndex - 1 : optIndex)
    .sort((a, b) => a - b)

  localQuestion.value = {
    ...localQuestion.value,
    options: newOptions,
    inputRule: {
      ...localQuestion.value.inputRule,
      correctOptions: newCorrectOptions
    }
  }
  // Update localOptions immediately
  localOptions.value = newOptions.map((text, idx) => ({
    id: idx,
    text
  }))
}

const toggleCorrect = (index: number) => {
  const currentCorrectOptions = localQuestion.value.inputRule.correctOptions
  const isCorrect = currentCorrectOptions.includes(index)

  let newCorrectOptions: number[]

  if (localQuestion.value.inputRule.type === 'single') {
    // Single choice: replace with this index
    newCorrectOptions = isCorrect ? [] : [index]
  } else {
    // Multiple choice: toggle this index
    if (isCorrect) {
      newCorrectOptions = currentCorrectOptions.filter(i => i !== index)
    } else {
      newCorrectOptions = [...currentCorrectOptions, index].sort((a, b) => a - b)
    }
  }

  localQuestion.value = {
    ...localQuestion.value,
    inputRule: {
      ...localQuestion.value.inputRule,
      correctOptions: newCorrectOptions
    }
  }
}
</script>

