<template>
    <CardWrapper
        :visible="true"
        :title="cardTitle"
        :desktopWidth="600"
        :closable="false"
    >
        <div
            v-if="loading"
            class="d-flex flex-column align-center justify-center"
            style="min-height: 200px"
        >
            <v-progress-circular
                indeterminate
                color="primary"
                size="48"
            />
            <span class="mt-4">{{ $t('storyView.loadingScenario') }}</span>
        </div>
        <div v-else-if="error">
            <v-alert
                type="error"
                class="mb-2"
                >{{ $t('storyView.loadingError') }} {{ error }}</v-alert
            >
        </div>
        <div v-else-if="config">
            <pre class="text-body-2">{{ config }}</pre>
        </div>
        <div v-else>
            <span>{{ $t('storyView.scenarioNotFound') }}</span>
        </div>
    </CardWrapper>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CardWrapper from '@/components/CardWrapper.vue'

const route = useRoute()
const storyId = ref(route.path.split('/').pop())
const loading = ref(true)
const error = ref(null)
const config = ref(null)
const cardTitle = ref('scenario')
const { t, messages } = useI18n()

const loadStoryTranslations = async (story) => {
    try {
        const res = await fetch(`/stories/${story}/langs.json`)
        if (!res.ok) return
        const storyMessages = await res.json()
        await Promise.all(
            Object.entries(storyMessages).map(async ([lang, msg]) => {
                messages.value[lang] = { ...messages.value[lang], ...msg }
            }),
        )
    } catch (e) {
        // ignorujemy błędy tłumaczeń scenariusza
    }
}

async function loadConfig() {
    loading.value = true
    error.value = null
    config.value = null
    try {
        const configPath = `/stories/${storyId.value}/config.json`
        const res = await fetch(configPath)
        if (!res.ok) throw new Error('Nie można pobrać configu scenariusza')
        const conf = await res.json()
        config.value = JSON.stringify(conf, null, 2)
        await loadStoryTranslations(storyId.value)
        cardTitle.value = t(conf.title || 'storyView.scenario')
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

onMounted(loadConfig)
watch(
    () => route.params.id,
    (newId) => {
        storyId.value = newId
        loadConfig()
    },
)
</script>
