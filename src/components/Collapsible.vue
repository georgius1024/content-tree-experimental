<template>
  <div :style="style" ref="rootEl">
    <slot> </slot>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type TransitionFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'

type Props = {
  value: boolean
  duration: number
  transition: TransitionFunction
}

const props = withDefaults(defineProps<Props>(), {
  value: true,
  duration: 200,
  transition: 'linear'
})

const rootEl = ref<HTMLElement | null>(null)
const maxHeight = ref<string>(props.value ? '0' : 'unset')
const overflow = ref<string>(props.value ? 'hidden' : 'unset')

const style = computed(() => {
  return {
    transition: `max-height ${props.transition} ${props.duration}ms`,
    maxHeight: maxHeight.value,
    overflow: overflow.value
  } as Record<string, string>
})

const onTransitionEnd = (e: TransitionEvent) => {
  if (rootEl.value && e.target === rootEl.value) {
    if (!props.value) {
      maxHeight.value = 'unset'
      overflow.value = 'unset'
    }
  }
}

onMounted(() => {
  if (rootEl.value) {
    rootEl.value.addEventListener('transitionend', onTransitionEnd)
  }
})

onBeforeUnmount(() => {
  if (rootEl.value) {
    rootEl.value.removeEventListener('transitionend', onTransitionEnd)
  }
})

watch(
  () => props.value,
  (newValue, oldValue) => {
    if (oldValue !== newValue && rootEl.value) {
      if (maxHeight.value === 'unset') {
        maxHeight.value = `${rootEl.value.scrollHeight}px`
        overflow.value = 'hidden'
      }
      nextTick(() => {
        setTimeout(() => {
          if (!rootEl.value) return
          maxHeight.value = newValue ? '0' : `${rootEl.value.scrollHeight}px`
        }, 0)
      })
    }
  }
)
</script>