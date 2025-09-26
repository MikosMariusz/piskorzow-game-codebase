import router from '@/router'
import pinia from '@/stores'
import vuetify from './vuetify'
import { setupI18n } from './i18n'

export async function registerPlugins(app) {
    app.use(vuetify)
    const { i18n, initialLocale } = await setupI18n(app, vuetify)
    app.use(i18n)
    if (vuetify?.locale?.current) {
        vuetify.locale.current.value = initialLocale
    }
    app.use(router).use(pinia)
}
