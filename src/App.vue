<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Toolbar from './components/Toolbar.vue';
import Container from './components/Container.vue';
import LocalePicker from './components/LocalePicker.vue';
import { BookOpen } from 'lucide-vue-next';
import { resetAllTrees } from './services/tree';
import { resetAllCourses } from './services/courses';

const { t, locale } = useI18n();
const router = useRouter();

const onResetTree = async () => {
  const ok = window.confirm(t('mainPage.resetConfirm'));
  if (!ok) return;
  const currentLocale = locale.value as 'en' | 'ru';
  await resetAllTrees(currentLocale);
  resetAllCourses(currentLocale);
  router.push({ path: '/' });
};
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
        <button
          type="button"
          class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          @click="onResetTree"
        >
          {{ t('mainPage.resetTree') }}
        </button>
        <LocalePicker />
      </template>
    </Toolbar>
    <Container class="py-6">
      <RouterView />
    </Container>
  </div>
</template>
