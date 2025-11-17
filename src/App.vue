<script setup lang="ts">
import Toolbar from './components/Toolbar.vue'
import Container from './components/Container.vue'
import LocalePicker from './components/LocalePicker.vue'
import { BookOpen } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Toolbar>
      <template #start>
        <div class="flex items-center gap-2">
          <BookOpen :size="20" class="text-blue-600" />
          <h1 class="text-lg font-semibold text-gray-900">Tree UX</h1>
        </div>
      </template>
      <template #end>
        <LocalePicker />
      </template>
    </Toolbar>
    <Container class="py-6">
      <RouterView />
    </Container>
  </div>
</template>
