<template>
  <div
    class="flex items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white"
    :class="class"
  >
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <slot name="start">
        <h2 v-if="title" class="text-sm font-medium text-gray-700 truncate">
          {{ title }}
        </h2>
      </slot>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      <slot name="end" />
    </div>
  </div>
</template>

<script setup lang="ts">
type Props = {
  title?: string
  class?: string
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  class: undefined,
})
</script>

