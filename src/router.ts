import { createRouter, createWebHistory } from 'vue-router'
import MainPage from './pages/MainPage.vue'
import FolderEditorPage from './pages/FolderEditorPage.vue'

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
      path: '/folder/:path(.*)',
      name: 'folder-editor',
      component: FolderEditorPage
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



