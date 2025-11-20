import { createRouter, createWebHistory } from 'vue-router'
import MainPage from './pages/MainPage.vue'
import FolderEditorPage from './pages/FolderEditorPage.vue'
import CourseEditorPage from './pages/CourseEditorPage.vue'
import CoursePage from './pages/CoursePage.vue'
import CoursePreviewPage from './pages/CoursePreviewPage.vue'

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
      path: '/folder/new',
      name: 'folder-editor-new',
      component: FolderEditorPage
    },
    {
      path: '/folder/:path(.*)',
      name: 'folder-editor',
      component: FolderEditorPage
    },
    {
      path: '/course/new',
      name: 'course-editor-new',
      component: CourseEditorPage
    },
    {
      path: '/course-editor/:path(.*)',
      name: 'course-editor',
      component: CourseEditorPage
    },
    {
      path: '/course-preview/:path(.*)',
      name: 'course-preview',
      component: CoursePreviewPage
    },
    {
      path: '/course/:path(.*)/',
      name: 'course',
      component: CoursePage
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



