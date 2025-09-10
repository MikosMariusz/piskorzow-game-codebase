import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import { useAppStore } from '@/stores/app'
import App from './App.vue'
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)
    .then(async () => {
        // Mount app first to initialize Pinia and show loading overlay
        app.mount('#app')

        // Then check GPS access - this will hide loading screen when done
        const appStore = useAppStore()
        await appStore.checkGpsAccess()
    })
    .catch((err) => {
        console.error('Plugins bootstrap failed:', err)
        // Mount app anyway but hide loading screen
        app.mount('#app')
        const appStore = useAppStore()
        setTimeout(() => {
            appStore.setLoading(false)
        }, 2000)
    })
