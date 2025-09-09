import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import App from './App.vue'
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)
    .then(() => {
        app.mount('#app')
    })
    .catch((err) => {
        console.error('Plugins bootstrap failed:', err)
        // ewentualnie: app.mount('#app');
    })
