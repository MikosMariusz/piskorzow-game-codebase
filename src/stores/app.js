import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { checkGpsAccessAndAccuracy } from '@/services/gps'

export const useAppStore = defineStore('app', () => {
    // State
    const homePageActive = ref(true)
    const gpsAccess = ref(null)
    const isLoading = ref(true)
    const gameCardVisible = ref(false)

    const activeWindow = ref(null)
    const projectInfoDismissed = ref(localStorage.getItem('projectInfoDialogDismissed') === 'true')
    const isWindowClosedByReplacement = ref(false)

    // Getters
    const isHomePage = computed(() => homePageActive.value)
    const hasGpsAccess = computed(() => {
        return gpsAccess.value === true
    })
    const isGpsChecked = computed(() => gpsAccess.value !== null)
    const getIsLoading = computed(() => isLoading.value)
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

    const updateHomePageFromRoute = (routePath) => {
        const shouldBeHomePage = routePath === '/' || routePath === '/index'
        setHomePage(shouldBeHomePage)
        return shouldBeHomePage
    }

    const checkGpsAccess = async () => {
        try {
            const gpsResult = await checkGpsAccessAndAccuracy()
            gpsAccess.value = gpsResult.access

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

            setTimeout(() => {
                setLoading(false)
            }, 3000)
        }
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

    const openWindow = (windowType) => {
        if (activeWindow.value) {
            isWindowClosedByReplacement.value = true
            closeWindow()
            setTimeout(() => {
                isWindowClosedByReplacement.value = false
            }, 50)
        }

        activeWindow.value = windowType

        if (windowType === 'game') {
            gameCardVisible.value = true
        }
    }

    const closeWindow = () => {
        const currentWindow = activeWindow.value
        activeWindow.value = null

        if (currentWindow === 'game') {
            gameCardVisible.value = false
        }

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
        isLoading,
        gameCardVisible,
        activeWindow,
        projectInfoDismissed,
        isWindowClosedByReplacement,
        // getters
        isHomePage,
        hasGpsAccess,
        isGpsChecked,
        getIsLoading,
        isProjectInfoVisible,
        isProjectInfoDismissed,
        shouldShowProjectInfo,
        getIsWindowClosedByReplacement,
        // actions
        setHomePage,
        updateHomePageFromRoute,
        checkGpsAccess,
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
