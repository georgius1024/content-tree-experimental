<template>
  <div class="fixed top-4 right-4 z-50">
    <div class="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white/90 px-2 py-1 text-xs font-medium shadow-sm backdrop-blur">
      <span class="text-gray-500 mr-1">{{ t('localePicker.label') }}</span>
      <button
        v-for="option in locales"
        :key="option.code"
        type="button"
        class="rounded-full px-2 py-1 transition"
        :class="option.code === currentLocale ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
        @click="setLocale(option.code)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' }
]

const currentLocale = computed(() => locale.value)

const setLocale = (next: string) => {
  if (next === locale.value) return
  locale.value = next
}

watch(
  () => locale.value,
  (next) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('locale', next)
    }
  },
  { immediate: true }
)
</script>


