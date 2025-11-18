import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3'
import '../src/style.css'
import i18n from '../src/i18n'
import { resetAllTrees } from '../src/services/tree'
import { resetAllCourses } from '../src/services/courses'

setup((app) => {
  app.use(i18n)
  
  // Initialize services with default keys
  const initialLocale = i18n.global.locale.value as 'en' | 'ru'
  resetAllTrees(initialLocale)
  resetAllCourses(initialLocale)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (story) => {
      // Reset services for each story
      const currentLocale = i18n.global.locale.value as 'en' | 'ru'
      resetAllTrees(currentLocale)
      resetAllCourses(currentLocale)
      return story()
    },
  ],
};

export default preview;