import { createRouter, createWebHistory } from 'vue-router'
import MainPage from './pages/MainPage.vue'
import EditorPage from './pages/EditorPage.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainPage,
      props: () => ({ path: '/' })
    },
    {
      path: '/edit/:path(.*)',
      name: 'edit',
      component: EditorPage
    },
    {
      path: '/:path(.*)/',
      name: 'node',
      component: MainPage,
      props: (route) => {
        const p = (route.params.path as string) || ''
        return { path: `/${p}/` }
      }
    }
  ]
})



