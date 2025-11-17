import { createI18n } from 'vue-i18n'
import en from './locales/en'
import ru from './locales/ru'

const messages = {
  en,
  ru,
}

const getInitialLocale = (): keyof typeof messages => {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const saved = window.localStorage.getItem('locale')
  if (saved && saved in messages) {
    return saved as keyof typeof messages
  }

  const browserLang = window.navigator.language?.split('-')[0]?.toLowerCase()
  if (browserLang && browserLang in messages) {
    return browserLang as keyof typeof messages
  }

  return 'en'
}

const initialLocale = getInitialLocale()

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: initialLocale,
  fallbackLocale: 'en',
  messages,
})

export default i18n

