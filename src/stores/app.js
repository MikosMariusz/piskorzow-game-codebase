import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
    state: () => ({
        darkEnabled: true,
    }),

    getters: {
        isDarkEnabled: (state) => state.darkEnabled,
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
    },
})
