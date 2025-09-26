import { createI18n } from 'vue-i18n'

export async function loadMessages() {
    const res = await fetch('/langs.json', { cache: 'no-cache' })
    if (!res.ok) throw new Error('Nie mogę pobrać /langs.json')
    return await res.json()
}

export function createI18nInstance(messages, initialLocale = 'en') {
    return createI18n({
        legacy: false,
        globalInjection: true,
        locale: initialLocale,
        fallbackLocale: 'en',
        messages,
    })
}

export async function setupI18n(app, vuetifyInstance) {
    const stored = localStorage.getItem('locale')
    const browserLang = navigator.language?.toLowerCase()
    let browser = 'en'

    if (browserLang?.startsWith('pl')) {
        browser = 'pl'
    } else if (browserLang?.startsWith('es')) {
        browser = 'es'
    } else {
        browser = 'en'
    }

    let initialLocale = stored || browser || 'en'

    const messages = await loadMessages()
    if (!messages[initialLocale]) initialLocale = 'en'

    const i18n = createI18nInstance(messages, initialLocale)

    const setLocale = (loc) => {
        if (!messages[loc]) return
        i18n.global.locale.value = loc
        document.documentElement.setAttribute('lang', loc)
        if (vuetifyInstance?.locale?.current) {
            vuetifyInstance.locale.current.value = loc
        }
        localStorage.setItem('locale', loc)
    }

    document.documentElement.setAttribute('lang', initialLocale)

    app.provide('setLocale', setLocale)

    return { i18n, initialLocale, setLocale }
}
