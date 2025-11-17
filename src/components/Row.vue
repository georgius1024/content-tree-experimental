<template>
  <div :class="rowClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  gutter?: 'none' | 'sm' | 'md' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  gutter: 'md',
  class: undefined,
})

const rowClass = computed(() => {
  const classes = ['flex', 'flex-wrap']
  
  const gutterClasses = {
    none: '',
    sm: '-mx-2',
    md: '-mx-4',
    lg: '-mx-6',
  }
  
  if (gutterClasses[props.gutter]) {
    classes.push(gutterClasses[props.gutter])
  }
  
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes.join(' ')
})
</script>

