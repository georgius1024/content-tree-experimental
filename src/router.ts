import { createRouter, createWebHistory } from 'vue-router'

// Lazy load all page components for code splitting
const MainPage = () => import('./pages/MainPage.vue')
const FolderEditorPage = () => import('./pages/FolderEditorPage.vue')
const CourseEditorPage = () => import('./pages/CourseEditorPage.vue')
const CoursePage = () => import('./pages/CoursePage.vue')
const CoursePreviewPage = () => import('./pages/CoursePreviewPage.vue')
const ModulePage = () => import('./pages/ModulePage.vue')

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
      path: '/module',
      name: 'module-demo',
      component: ModulePage,
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



