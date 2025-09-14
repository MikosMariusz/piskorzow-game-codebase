import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { checkGpsAccessAndAccuracy } from '@/services/gps'

export const useAppStore = defineStore('app', () => {
    // State
    const homePageActive = ref(true)
    const gpsAccess = ref(null) // null = not checked yet
    const gpsInfo = ref(null)
    const isLoading = ref(true)
    const gameCardVisible = ref(false)

    // Getters
    const isHomePage = computed(() => homePageActive.value)
    const hasGpsAccess = computed(() => {
        const result = gpsAccess.value === true
        console.log('🔎 hasGpsAccess computed:', result, 'gpsAccess.value:', gpsAccess.value)
        return result
    })
    const getGpsInfo = computed(() => gpsInfo.value)
    const isGpsChecked = computed(() => gpsAccess.value !== null)
    const getIsLoading = computed(() => isLoading.value)
    const isGameCardVisible = computed(() => gameCardVisible.value)

    // Actions
    const setHomePage = (value) => {
        homePageActive.value = value
    }

    const toggleHomePage = () => {
        homePageActive.value = !homePageActive.value
    }

    const isHomePageRoute = (routePath) => {
        return routePath === '/' || routePath === '/index'
    }

    const updateHomePageFromRoute = (routePath) => {
        const shouldBeHomePage = isHomePageRoute(routePath)
        setHomePage(shouldBeHomePage)
        return shouldBeHomePage
    }

    const checkGpsAccess = async () => {
        console.log('🔍 Sprawdzam dostęp do GPS...')

        try {
            const gpsResult = await checkGpsAccessAndAccuracy()
            console.log('📍 GPS result:', gpsResult)

            gpsAccess.value = gpsResult.access
            gpsInfo.value = gpsResult

            // Dodaj debugging
            console.log('📱 Is mobile:', gpsResult.isMobile)
            console.log('✅ GPS access:', gpsResult.access)
            console.log('📍 Accuracy:', gpsResult.accuracy)

            setTimeout(() => {
                setLoading(false)
            }, 3000)

            return gpsResult
        } catch (error) {
            console.error('❌ Error checking GPS access:', error)
            gpsAccess.value = false
            gpsInfo.value = { access: false, reason: 'Check failed', error: error.message }

            setTimeout(() => {
                setLoading(false)
            }, 3000)

            return gpsInfo.value
        }
    }

    const setGpsAccess = (access, info = null) => {
        gpsAccess.value = access
        gpsInfo.value = info
    }

    const setLoading = (loadingState) => {
        isLoading.value = loadingState
    }

    const setGameCardVisible = (visible) => {
        gameCardVisible.value = visible
    }

    const toggleGameCard = () => {
        gameCardVisible.value = !gameCardVisible.value
    }

    return {
        // state
        homePageActive,
        gpsAccess,
        gpsInfo,
        isLoading,
        gameCardVisible,
        // getters
        isHomePage,
        hasGpsAccess,
        getGpsInfo,
        isGpsChecked,
        getIsLoading,
        isGameCardVisible,
        // actions
        setHomePage,
        toggleHomePage,
        isHomePageRoute,
        updateHomePageFromRoute,
        checkGpsAccess,
        setGpsAccess,
        setLoading,
        setGameCardVisible,
        toggleGameCard,
    }
})
