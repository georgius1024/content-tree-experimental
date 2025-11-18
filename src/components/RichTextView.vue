<template>
  <article class="rich-text-content" v-html="content" />
</template>

<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

