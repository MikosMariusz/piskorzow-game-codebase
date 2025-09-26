import { setupLayouts } from 'virtual:generated-layouts'
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

router.beforeEach((to, from, next) => {
    const appStore = useAppStore()
    appStore.updateHomePageFromRoute(to.path)
    if (
        to.path === '/' ||
        to.path === '/index' ||
        (to.path === '/game' && !appStore.hasGpsAccess)
    ) {
        appStore.closeWindow()
    } else if (
        (to.path.startsWith('/game/') && appStore.hasGpsAccess) ||
        to.path.startsWith('/presentation/')
    ) {
        appStore.setGameCardVisible(true)
    }

    next()
})

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
