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

    // Card Window Management - only one window can be active at a time
    const activeWindow = ref(null) // null, 'game', 'projectInfo'
    const projectInfoDismissed = ref(localStorage.getItem('projectInfoDialogDismissed') === 'true')
    const isWindowClosedByReplacement = ref(false) // flag to disable close animation when replaced by another window

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
    const isGameCardVisible = computed(() => activeWindow.value === 'game')

    // Card Window getters
    const getActiveWindow = computed(() => activeWindow.value)
    const isProjectInfoVisible = computed(() => activeWindow.value === 'projectInfo')
    const isProjectInfoDismissed = computed(() => projectInfoDismissed.value)
    const shouldShowProjectInfo = computed(
        () => !isLoading.value && !projectInfoDismissed.value && activeWindow.value === null,
    )
    const getIsWindowClosedByReplacement = computed(() => isWindowClosedByReplacement.value)

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
        if (visible && activeWindow.value !== 'game') {
            openWindow('game')
        } else if (!visible && activeWindow.value === 'game') {
            closeWindow()
        }
    }

    const toggleGameCard = () => {
        if (activeWindow.value === 'game') {
            closeWindow()
        } else {
            openWindow('game')
        }
    }

    // Card Window Management Actions
    const openWindow = (windowType) => {
        // If there's an active window, mark it for replacement (no close animation)
        if (activeWindow.value) {
            isWindowClosedByReplacement.value = true
            closeWindow()
            // Reset the flag after a brief delay to allow the closing to complete
            setTimeout(() => {
                isWindowClosedByReplacement.value = false
            }, 50)
        }

        activeWindow.value = windowType

        if (windowType === 'game' && hasGpsAccess.value) {
            gameCardVisible.value = true
        }
    }

    const closeWindow = () => {
        const currentWindow = activeWindow.value
        activeWindow.value = null

        if (currentWindow === 'game') {
            gameCardVisible.value = false
        }

        // Reset replacement flag if no new window is being opened
        if (!isWindowClosedByReplacement.value) {
            // Normal close - keep animation enabled
        }
    }

    const openProjectInfo = () => {
        openWindow('projectInfo')
    }

    const closeProjectInfo = () => {
        closeWindow()
    }

    const dismissProjectInfo = (permanently = false) => {
        if (permanently) {
            projectInfoDismissed.value = true
            localStorage.setItem('projectInfoDialogDismissed', 'true')
        }
        closeProjectInfo()
    }

    const resetProjectInfoDismissal = () => {
        projectInfoDismissed.value = false
        localStorage.removeItem('projectInfoDialogDismissed')
    }

    const checkAndShowProjectInfo = () => {
        if (shouldShowProjectInfo.value) {
            openProjectInfo()
            return true
        }
        return false
    }

    return {
        // state
        homePageActive,
        gpsAccess,
        gpsInfo,
        isLoading,
        gameCardVisible,
        activeWindow,
        projectInfoDismissed,
        isWindowClosedByReplacement,
        // getters
        isHomePage,
        hasGpsAccess,
        getGpsInfo,
        isGpsChecked,
        getIsLoading,
        isGameCardVisible,
        getActiveWindow,
        isProjectInfoVisible,
        isProjectInfoDismissed,
        shouldShowProjectInfo,
        getIsWindowClosedByReplacement,
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
        openWindow,
        closeWindow,
        openProjectInfo,
        closeProjectInfo,
        dismissProjectInfo,
        resetProjectInfoDismissal,
        checkAndShowProjectInfo,
    }
})
