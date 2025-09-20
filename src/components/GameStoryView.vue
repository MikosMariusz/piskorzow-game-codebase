<template>
    <CardWrapper
        :visible="true"
        :title="computedTitle"
        :desktopWidth="600"
        :closable="false"
    >
        <template #header-buttons-left>
            <v-btn
                icon="mdi-map-marker"
                variant="elevated"
                size="small"
                class="mr-2"
                elevation="2"
                rounded="sm"
                color="primary"
                :title="$t('storyView.focusStepOnMap')"
                @click="focusStepOnMap"
            />
        </template>
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
        <div
            v-if="config"
            class="story-container"
        >
            <div
                class="navigation-buttons"
                v-if="config.steps && config.steps.length > 1 && !isGame"
            >
                <v-btn
                    :disabled="!hasPrev"
                    @click="prevStep"
                    variant="outlined"
                    size="small"
                    class="nav-btn"
                >
                    <v-icon left>mdi-chevron-left</v-icon>
                    {{ $t('storyView.previousStep') }}
                </v-btn>

                <span class="step-counter">
                    {{
                        $t('storyView.stepCounter', {
                            current: activeIndex + 1,
                            total: config.steps?.length || 0,
                        })
                    }}
                </span>
                <v-btn
                    :disabled="!hasNext"
                    @click="nextStep"
                    variant="outlined"
                    size="small"
                    class="nav-btn"
                >
                    {{ $t('storyView.nextStep') }}
                    <v-icon right>mdi-chevron-right</v-icon>
                </v-btn>
            </div>
            <GameStep
                :steps="config.steps || []"
                :active-index="activeIndex"
                :story-id="storyId"
                @update-title="updateCardTitle"
                @next-step="nextStep"
            />
        </div>
        <div v-else>
            <span>{{ $t('storyView.scenarioNotFound') }}</span>
        </div>
    </CardWrapper>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CardWrapper from '@/components/CardWrapper.vue'
import GameStep from '@/components/GameStep.vue'

import { setStoryView } from '@/services/olMap'

const route = useRoute()
const storyId = ref(route.path.split('/').pop())
const loading = ref(true)
const error = ref(null)
const config = ref(null)
const cardTitle = ref('scenario')
const activeIndex = ref(0)
const { t } = useI18n()

const hasNext = computed(() => {
    return config.value && config.value.steps && activeIndex.value < config.value.steps.length - 1
})
const hasPrev = computed(() => {
    return activeIndex.value > 0
})
const isGame = computed(() => {
    return !route.path.startsWith('/game')
})

const computedTitle = computed(() => {
    const baseTitle = t(cardTitle.value)

    // Dodaj licznik kroków jeśli jesteśmy w grze
    if (isGame.value && config.value?.steps) {
        const stepCounter = `(${activeIndex.value + 1}/${config.value.steps.length})`
        return `${stepCounter} ${baseTitle}`
    }

    return baseTitle
})

const nextStep = () => {
    if (hasNext.value) {
        activeIndex.value++
        const step = config.value?.steps?.[activeIndex.value]
        if (step) {
            setStoryView({
                feature: step.feature,
                view: step.view,
            })
        }
    }
}

const prevStep = () => {
    if (hasPrev.value) {
        activeIndex.value--
        const step = config.value?.steps?.[activeIndex.value]
        if (step) {
            setStoryView({
                feature: step.feature,
                view: step.view,
            })
        }
    }
}

const updateCardTitle = (titleKey) => {
    if (titleKey) {
        cardTitle.value = titleKey
    } else {
        cardTitle.value = config.value?.title || 'storyView.scenario'
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
        config.value = conf
        activeIndex.value = 0

        if (conf.steps && conf.steps.length > 0 && conf.steps[0].title) {
            updateCardTitle(conf.steps[0].title)
            setStoryView({
                feature: conf.steps[0].feature,
                view: conf.steps[0].view,
            })
        } else {
            updateCardTitle(null)
        }
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

const focusStepOnMap = () => {
    const step = config.value?.steps?.[activeIndex.value]
    if (step) {
        setStoryView({
            feature: step.feature,
            view: step.view,
        })
    }
}

onMounted(() => {
    loadConfig()
})
</script>

<style scoped>
.story-container {
    position: relative;
    height: 100%;
    width: 100%;
}

.navigation-buttons {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.5);
    padding: 12px 24px;
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(4px);
}

.nav-btn {
    min-width: 120px;
}

.step-counter {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.8);
    white-space: nowrap;
}
</style>
