import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import { useAppStore } from '@/stores/app'
import App from './App.vue'
import 'unfonts.css'
import 'flag-icons/css/flag-icons.min.css'

const app = createApp(App)

registerPlugins(app)
    .then(async () => {
        app.mount('#app')
        const appStore = useAppStore()
        await appStore.checkGpsAccess()
    })
    .catch((err) => {
        console.error('Plugins bootstrap failed:', err)
        app.mount('#app')
        const appStore = useAppStore()
        setTimeout(() => {
            appStore.setLoading(false)
        }, 2000)
    })
