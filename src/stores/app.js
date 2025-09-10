import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { checkGpsAccessAndAccuracy } from '@/services/gps'

export const useAppStore = defineStore('app', () => {
    // State
    const darkEnabled = ref(true)
    const gpsAccess = ref(null) // null = not checked yet
    const gpsInfo = ref(null)
    const isLoading = ref(true)

    // Getters
    const isDarkEnabled = computed(() => darkEnabled.value)
    const hasGpsAccess = computed(() => {
        const result = gpsAccess.value === true
        console.log('🔎 hasGpsAccess computed:', result, 'gpsAccess.value:', gpsAccess.value)
        return result
    })
    const getGpsInfo = computed(() => gpsInfo.value)
    const isGpsChecked = computed(() => gpsAccess.value !== null)
    const getIsLoading = computed(() => isLoading.value)

    // Actions
    const setDarkEnabled = (value) => {
        darkEnabled.value = value
    }

    const toggleDarkEnabled = () => {
        darkEnabled.value = !darkEnabled.value
    }

    const shouldUseDarkMode = (routePath) => {
        return routePath === '/' || routePath === '/index'
    }

    const updateDarkModeFromRoute = (routePath) => {
        const shouldBeDark = shouldUseDarkMode(routePath)
        setDarkEnabled(shouldBeDark)
        return shouldBeDark
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

    return {
        // state
        darkEnabled,
        gpsAccess,
        gpsInfo,
        isLoading,
        // getters
        isDarkEnabled,
        hasGpsAccess,
        getGpsInfo,
        isGpsChecked,
        getIsLoading,
        // actions
        setDarkEnabled,
        toggleDarkEnabled,
        shouldUseDarkMode,
        updateDarkModeFromRoute,
        checkGpsAccess,
        setGpsAccess,
        setLoading,
    }
})
