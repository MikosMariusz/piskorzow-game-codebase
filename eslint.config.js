import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import vuetify from 'eslint-config-vuetify'

const USE_SKIP_FORMATTING = true // zmień na false jeśli chcesz mieć reguły formatowania

export default [
    ...vuetify(), // reguły Vuetify
    ...(USE_SKIP_FORMATTING ? [skipFormatting] : []),
]
