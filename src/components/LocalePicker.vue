<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        class="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span class="rounded-full bg-blue-600 px-2 py-0.5 text-white">
          {{ currentLocaleLabel }}
        </span>
        <ChevronDown :size="14" class="text-gray-400" aria-hidden="true" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      >
        <div class="px-1 py-1">
          <MenuItem v-for="option in locales" :key="option.code" v-slot="{ active }">
            <button
              type="button"
              :class="[
                active ? 'bg-blue-50 text-blue-900' : 'text-gray-900',
                option.code === currentLocale ? 'font-semibold' : 'font-normal',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]"
              @click="setLocale(option.code)"
            >
              <span class="mr-2">{{ option.flag }}</span>
              {{ option.label }}
              <Check
                v-if="option.code === currentLocale"
                :size="16"
                class="ml-auto text-blue-600"
                aria-hidden="true"
              />
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { ChevronDown, Check } from 'lucide-vue-next';

const { locale, t } = useI18n();

const locales = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const currentLocale = computed(() => locale.value);

const currentLocaleLabel = computed(() => {
  const found = locales.find((l) => l.code === currentLocale.value);
  return found ? found.code.toUpperCase() : 'EN';
});

const setLocale = (next: string) => {
  if (next === locale.value) return;
  locale.value = next;
};

watch(
  () => locale.value,
  (next) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('locale', next);
    }
  },
  { immediate: true },
);
</script>
