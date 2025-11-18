<template>
  <div>
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 py-2"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <div
        class="min-w-0 flex-1 text-left"
        :class="caretPosition === 'left' ? 'flex items-center gap-2' : ''"
      >
        <!-- Left indicator -->
        <ChevronRight
          v-if="caretPosition === 'left' && indicatorType === 'chevron'"
          class="shrink-0 transition-transform"
          :class="isOpen ? 'rotate-90' : 'rotate-0'"
          :size="18"
          aria-hidden="true"
        />
        <component
          v-else-if="caretPosition === 'left' && indicatorType === 'folder'"
          :is="isOpen ? FolderOpen : Folder"
          class="shrink-0 transition-all"
          :size="18"
          aria-hidden="true"
        />
        <slot name="header">{{ label }}</slot>
      </div>
      <!-- Right indicator -->
      <ChevronRight
        v-if="caretPosition === 'right' && indicatorType === 'chevron'"
        class="shrink-0 transition-transform"
        :class="isOpen ? 'rotate-90' : 'rotate-0'"
        :size="18"
        aria-hidden="true"
      />
      <component
        v-else-if="caretPosition === 'right' && indicatorType === 'folder'"
        :is="isOpen ? FolderOpen : Folder"
        class="shrink-0 transition-all"
        :size="18"
        aria-hidden="true"
      />
    </button>
    <Collapsible
      :value="!isOpen"
      :duration="duration"
      :transition="transition"
    >
      <slot />
    </Collapsible>
  </div>
  </template>
  <script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import Collapsible from './Collapsible.vue'
  import { ChevronRight, Folder, FolderOpen } from 'lucide-vue-next'
  
  type TransitionFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'
  
  type Props = {
    label?: string
    open?: boolean
    duration?: number
    transition?: TransitionFunction
    caretPosition?: 'left' | 'right'
    indicatorType?: 'chevron' | 'folder'
  }
  
  const props = withDefaults(defineProps<Props>(), {
    label: '',
    open: false,
    duration: 200,
    transition: 'linear',
    caretPosition: 'right',
    indicatorType: 'chevron'
  })
  
  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'toggle', value: boolean): void
  }>()
  
  const isOpen = ref<boolean>(props.open)
  
  watch(
    () => props.open,
    (next) => {
      isOpen.value = next
    }
  )
  
  const toggle = () => {
    const next = !isOpen.value
    isOpen.value = next
    emit('update:open', next)
    emit('toggle', next)
  }
  
  const duration = computed(() => props.duration)
  const transition = computed(() => props.transition)
  const label = computed(() => props.label)
  const caretPosition = computed(() => props.caretPosition)
  </script>

