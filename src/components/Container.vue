<template>
  <div :class="containerClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  fluid?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  fluid: false,
  maxWidth: '2xl',
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
      full: 'max-w-full',
    }
    classes.push(maxWidthClasses[props.maxWidth])
  }
  
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes.join(' ')
})
</script>

