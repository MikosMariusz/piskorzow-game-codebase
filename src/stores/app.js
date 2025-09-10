import { defineStore } from 'pinia'
import { checkGpsAccessAndAccuracy } from '@/services/gps'

export const useAppStore = defineStore('app', {
    state: () => ({
        darkEnabled: true,
        gpsAccess: null, // null = not checked yet, true/false based on access
        gpsInfo: null, // stores additional GPS information (accuracy, reason, etc.)
        isLoading: true, // loading screen state
    }),

    getters: {
        isDarkEnabled: (state) => state.darkEnabled,
        hasGpsAccess: (state) => state.gpsAccess,
        getGpsInfo: (state) => state.gpsInfo,
        isGpsChecked: (state) => state.gpsAccess !== null,
        getIsLoading: (state) => state.isLoading,
    },

    actions: {
        setDarkEnabled(value) {
            this.darkEnabled = value
        },

        toggleDarkEnabled() {
            this.darkEnabled = !this.darkEnabled
        },

        shouldUseDarkMode(routePath) {
            return routePath === '/' || routePath === '/index'
        },

        updateDarkModeFromRoute(routePath) {
            const shouldBeDark = this.shouldUseDarkMode(routePath)
            this.setDarkEnabled(shouldBeDark)
            return shouldBeDark
        },

        async checkGpsAccess() {
            try {
                const gpsResult = await checkGpsAccessAndAccuracy()
                this.gpsAccess = gpsResult.access
                this.gpsInfo = gpsResult
                console.log('GPS access check completed:', gpsResult)

                setTimeout(() => {
                    this.setLoading(false)
                }, 3000)

                return gpsResult
            } catch (error) {
                console.error('Error checking GPS access:', error)
                this.gpsAccess = false
                this.gpsInfo = { access: false, reason: 'Check failed', error: error.message }

                setTimeout(() => {
                    this.setLoading(false)
                }, 3000)

                return this.gpsInfo
            }
        },

        setGpsAccess(access, info = null) {
            this.gpsAccess = access
            this.gpsInfo = info
        },

        setLoading(isLoading) {
            this.isLoading = isLoading
        },
    },
})
