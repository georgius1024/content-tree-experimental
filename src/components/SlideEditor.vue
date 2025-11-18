<template>
  <div class="flex flex-col h-full space-y-4 min-h-0">
    <div class="flex-shrink-0">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('slideEditor.name') }}
        <span class="text-red-500">*</span>
      </label>
      <input
        :key="`slide-name-${props.modelValue.id}`"
        :value="localSlide.name"
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
        :placeholder="t('slideEditor.namePlaceholder')"
        @input="updateName(($event.target as HTMLInputElement).value)"
      />
      <p v-if="validationErrors.name" class="mt-1 text-xs text-red-500">
        {{ validationErrors.name }}
      </p>
    </div>
    <div class="flex flex-col flex-1 min-h-0">
      <label class="block text-sm font-medium text-gray-700 mb-1 flex-shrink-0">
        {{ t('slideEditor.content') }}
        <span class="text-red-500">*</span>
      </label>
      <div 
        :class="[
          'border rounded-md flex flex-col flex-1 min-h-0',
          validationErrors.content ? 'border-red-500' : 'border-gray-300'
        ]"
      >
        <RichTextEditor
          :model-value="localSlide.content"
          :placeholder="t('slideEditor.contentPlaceholder')"
          :readonly="props.readonly"
          @update:model-value="updateContent"
        />
      </div>
      <p v-if="validationErrors.content" class="mt-1 text-xs text-red-500 flex-shrink-0">
        {{ validationErrors.content }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Slide } from '../types'
import RichTextEditor from './RichTextEditor.vue'

const { t } = useI18n()

type Props = {
  modelValue: Slide
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [slide: Slide]
  'update:valid': [isValid: boolean]
}>()

const localSlide = computed({
  get(): Slide {
    return props.modelValue
  },
  set(value: Slide) {
    emit('update:modelValue', value)
  }
})

// Validation computed properties
const validationErrors = computed(() => {
  const errors: {
    name?: string
    content?: string
  } = {}

  // Name required
  if (!localSlide.value.name.trim()) {
    errors.name = t('slideEditor.validation.nameRequired')
  }

  // Content required (check if content is empty HTML)
  const contentText = localSlide.value.content.replace(/<[^>]*>/g, '').trim()
  if (!contentText) {
    errors.content = t('slideEditor.validation.contentRequired')
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

const updateName = (name: string) => {
  localSlide.value = {
    ...localSlide.value,
    name
  }
}

const updateContent = (content: string) => {
  localSlide.value = {
    ...localSlide.value,
    content
  }
}
</script>

