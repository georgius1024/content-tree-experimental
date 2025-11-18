import { createApp } from 'vue'
import './style.css'
import './styles/rich-text.css'
import App from './App.vue'
import { router } from './router'
import i18n from './i18n'
import { resetAllTrees } from './services/tree'
import { resetAllCourses } from './services/courses'

// Initialize services with default keys
const initialLocale = i18n.global.locale.value as 'en' | 'ru'
resetAllTrees(initialLocale).catch(console.error)
resetAllCourses(initialLocale)

createApp(App).use(router).use(i18n).mount('#app')
