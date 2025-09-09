/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */
import router from '@/router'
import pinia from '@/stores'
// Plugins
import vuetify from './vuetify'
import { setupI18n } from './i18n'

export async function registerPlugins(app) {
    // Najpierw Vuetify (żeby setLocale mógł go ustawić)
    app.use(vuetify)

    // i18n + spięcie języka z Vuetify
    const { i18n, initialLocale } = await setupI18n(app, vuetify)
    app.use(i18n)

    // Ustawiamy bieżący język w Vuetify
    if (vuetify?.locale?.current) {
        vuetify.locale.current.value = initialLocale
    }

    app.use(router).use(pinia)
}
