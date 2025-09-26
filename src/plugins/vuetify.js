import { createVuetify } from 'vuetify'
import { pl, en } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#D4851C',
                    'primary-darken-1': '#B8721A',
                    secondary: '#5A6C7D',
                    accent: '#E6A84A',
                    error: '#D32F2F',
                    warning: '#F57C00',
                    info: '#1976D2',
                    success: '#2E7D32',
                    background: '#FAFAFA',
                    surface: '#FFFFFF',
                    'surface-variant': '#F5F5F5',
                    'on-primary': '#FFFFFF',
                    'on-secondary': '#FFFFFF',
                    'on-surface': '#1D1D1D',
                },
            },
            dark: {
                colors: {
                    primary: '#F4A836',
                    'primary-darken-1': '#D4851C',
                    secondary: '#7B8A9B',
                    accent: '#F4C266',
                    error: '#F44336',
                    warning: '#FF9800',
                    info: '#2196F3',
                    success: '#4CAF50',
                    background: '#121212',
                    surface: '#1E1E1E',
                    'surface-variant': '#2A2A2A',
                    'on-primary': '#1D1D1D',
                    'on-secondary': '#1D1D1D',
                    'on-surface': '#FFFFFF',
                },
            },
        },
    },
    locale: {
        fallback: 'en',
        messages: { pl, en },
    },
})
