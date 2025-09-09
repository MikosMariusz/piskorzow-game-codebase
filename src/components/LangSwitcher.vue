<script setup>
import { inject, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const setLocale = inject('setLocale')
const { locale } = useI18n()

const model = computed({
    get: () => locale.value,
    set: (val) => setLocale?.(val),
})
</script>

<template>
    <v-btn-toggle
        v-model="model"
        variant="elevated"
        density="comfortable"
        divided
        color="primary"
        elevation="4"
    >
        <v-btn
            value="pl"
            size="small"
        >
            PL
        </v-btn>
        <v-btn
            value="en"
            size="small"
        >
            EN
        </v-btn>
    </v-btn-toggle>
</template>
