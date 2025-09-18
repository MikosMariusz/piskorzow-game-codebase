/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAppStore } from '@/stores/app'

const routesWithStories = [
    ...setupLayouts(routes),
    {
        path: '/game/:storyId',
        name: 'game-story',
        component: () => import('@/components/GameStoryView.vue'),
    },
    {
        path: '/presentation/:storyId',
        name: 'presentation-story',
        component: () => import('@/components/GameStoryView.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routesWithStories,
})

// Global before guard - aktualizuj home page przed każdą nawigacją
router.beforeEach((to, from, next) => {
    const appStore = useAppStore()
    appStore.updateHomePageFromRoute(to.path)
    // Zamknij wszystkie karty przy przejściu na stronę domową
    if (
        to.path === '/' ||
        to.path === '/index' ||
        (to.path === '/game' && !appStore.hasGpsAccess)
    ) {
        appStore.closeWindow()
    }
    next()
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
    if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
        if (localStorage.getItem('vuetify:dynamic-reload')) {
            console.error('Dynamic import error, reloading page did not fix it', err)
        } else {
            console.log('Reloading page to fix dynamic import error')
            localStorage.setItem('vuetify:dynamic-reload', 'true')
            location.assign(to.fullPath)
        }
    } else {
        console.error(err)
    }
})

router.isReady().then(() => {
    localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
