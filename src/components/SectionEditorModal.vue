<template>
  <TransitionRoot :show="open" as="template">
    <Dialog :open="open" @close="handleClose" class="relative z-50">
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
            <div class="flex items-center justify-between p-6 border-b">
              <DialogTitle class="text-lg font-semibold">
                {{ isCreating ? t('sectionEditorModal.createTitle') : t('sectionEditorModal.editTitle') }}
              </DialogTitle>
              <button
                type="button"
                class="rounded p-1 hover:bg-gray-100"
                @click="handleClose"
              >
                <X :size="20" class="text-gray-500" />
              </button>
            </div>

            <div class="p-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('sectionEditorModal.nameLabel') }}
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="localName"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    validationError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  :placeholder="t('sectionEditorModal.namePlaceholder')"
                  @input="validate"
                />
                <p v-if="validationError" class="mt-1 text-xs text-red-500">
                  {{ validationError }}
                </p>
              </div>
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
                type="button"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!isValid"
                @click="handleSave"
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
import type { Section } from '../types'

const { t } = useI18n()

type Props = {
  section: Section | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  'save': [section: Section]
}>()

const localName = ref('')
const validationError = ref<string | null>(null)

const isCreating = computed(() => props.section === null)

const isValid = computed(() => {
  return localName.value.trim().length > 0
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      localName.value = props.section?.name || ''
      validationError.value = null
    }
  }
)

const validate = () => {
  if (!localName.value.trim()) {
    validationError.value = t('sectionEditorModal.validation.nameRequired')
  } else {
    validationError.value = null
  }
}

const handleClose = () => {
  emit('update:open', false)
}

const handleSave = () => {
  if (!isValid.value) {
    validate()
    return
  }

  const section: Section = props.section
    ? {
        ...props.section,
        name: localName.value.trim()
      }
    : {
        id: `section-${Math.random().toString(36).substr(2, 9)}`,
        name: localName.value.trim(),
        steps: []
      }

  emit('save', section)
  emit('update:open', false)
}
</script>

