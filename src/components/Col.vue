<template>
  <div :class="colClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  cols?: number | string
  sm?: number | string
  md?: number | string
  lg?: number | string
  xl?: number | string
  offset?: number
  offsetSm?: number
  offsetMd?: number
  offsetLg?: number
  offsetXl?: number
  gutter?: 'none' | 'sm' | 'md' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  cols: undefined,
  sm: undefined,
  md: undefined,
  lg: undefined,
  xl: undefined,
  offset: undefined,
  offsetSm: undefined,
  offsetMd: undefined,
  offsetLg: undefined,
  offsetXl: undefined,
  gutter: 'md',
  class: undefined,
})

const colClass = computed(() => {
  const classes: string[] = []
  
  // Gutter padding
  const gutterClasses = {
    none: '',
    sm: 'px-2',
    md: 'px-4',
    lg: 'px-6',
  }
  
  if (gutterClasses[props.gutter]) {
    classes.push(gutterClasses[props.gutter])
  }
  
  // Column widths (12-column grid system)
  // Use flex-basis percentage approach for dynamic widths
  if (props.cols !== undefined) {
    if (typeof props.cols === 'number') {
      const percentage = (props.cols / 12) * 100
      classes.push('w-full', `md:flex-[0_0_${percentage}%]`, 'md:max-w-[none]')
    } else {
      classes.push(props.cols)
    }
  } else {
    classes.push('w-full')
  }
  
  // Responsive widths
  if (props.sm !== undefined) {
    if (typeof props.sm === 'number') {
      const percentage = (props.sm / 12) * 100
      classes.push(`sm:flex-[0_0_${percentage}%]`, 'sm:max-w-[none]')
    } else {
      classes.push(`sm:${props.sm}`)
    }
  }
  
  if (props.md !== undefined) {
    if (typeof props.md === 'number') {
      const percentage = (props.md / 12) * 100
      classes.push(`md:flex-[0_0_${percentage}%]`, 'md:max-w-[none]')
    } else {
      classes.push(`md:${props.md}`)
    }
  }
  
  if (props.lg !== undefined) {
    if (typeof props.lg === 'number') {
      const percentage = (props.lg / 12) * 100
      classes.push(`lg:flex-[0_0_${percentage}%]`, 'lg:max-w-[none]')
    } else {
      classes.push(`lg:${props.lg}`)
    }
  }
  
  if (props.xl !== undefined) {
    if (typeof props.xl === 'number') {
      const percentage = (props.xl / 12) * 100
      classes.push(`xl:flex-[0_0_${percentage}%]`, 'xl:max-w-[none]')
    } else {
      classes.push(`xl:${props.xl}`)
    }
  }
  
  // Offsets using margin-left percentage
  if (props.offset !== undefined) {
    const percentage = (props.offset / 12) * 100
    classes.push(`md:ml-[${percentage}%]`)
  }
  
  if (props.offsetSm !== undefined) {
    const percentage = (props.offsetSm / 12) * 100
    classes.push(`sm:ml-[${percentage}%]`)
  }
  
  if (props.offsetMd !== undefined) {
    const percentage = (props.offsetMd / 12) * 100
    classes.push(`md:ml-[${percentage}%]`)
  }
  
  if (props.offsetLg !== undefined) {
    const percentage = (props.offsetLg / 12) * 100
    classes.push(`lg:ml-[${percentage}%]`)
  }
  
  if (props.offsetXl !== undefined) {
    const percentage = (props.offsetXl / 12) * 100
    classes.push(`xl:ml-[${percentage}%]`)
  }
  
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes.join(' ')
})
</script>

