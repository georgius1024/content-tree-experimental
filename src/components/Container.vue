<template>
  <div :class="containerClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  fluid?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'container'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  fluid: false,
  maxWidth: '6xl',
  class: undefined,
})

const containerClass = computed(() => {
  const classes = ['mx-auto', 'px-4']
  
  if (props.fluid) {
    classes.push('w-full')
  } else {
    const maxWidthClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
      container: 'max-w-container',
    }
    classes.push(maxWidthClasses[props.maxWidth])
  }
  
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes.join(' ')
})
</script>

