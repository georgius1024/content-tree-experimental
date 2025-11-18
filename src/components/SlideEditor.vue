<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('slideEditor.name') }}</label>
      <input
        :model-value="localSlide.name"
        type="text"
        :readonly="props.readonly"
        :disabled="props.readonly"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        :placeholder="t('slideEditor.namePlaceholder')"
        @input="updateName(($event.target as HTMLInputElement).value)"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('slideEditor.content') }}</label>
      <RichTextEditor
        :model-value="localSlide.content"
        :placeholder="t('slideEditor.contentPlaceholder')"
        :readonly="props.readonly"
        @update:model-value="updateContent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
}>()

const localSlide = computed({
  get(): Slide {
    return props.modelValue
  },
  set(value: Slide) {
    emit('update:modelValue', value)
  }
})

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

