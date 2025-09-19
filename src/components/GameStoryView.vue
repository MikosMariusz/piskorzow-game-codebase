<template>
    <CardWrapper
        :visible="true"
        :title="t(cardTitle)"
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

        <div
            v-if="config"
            class="story-container"
        >
            <!-- Przyciski nawigacji - zawieszone nad zawartością -->
            <div
                class="navigation-buttons"
                v-if="config.steps && config.steps.length > 1"
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
            />
        </div>
        <div v-else>
            <span>{{ $t('storyView.scenarioNotFound') }}</span>
        </div>
    </CardWrapper>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
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

// Computed
const hasNext = computed(() => {
    return config.value && config.value.steps && activeIndex.value < config.value.steps.length - 1
})

const hasPrev = computed(() => {
    return activeIndex.value > 0
})

// Functions
const nextStep = () => {
    if (hasNext.value) {
        activeIndex.value++
        // Ustaw widok mapy dla nowego kroku
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
        // Ustaw widok mapy dla nowego kroku
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
        cardTitle.value = config.value
            ? t(config.value.title || 'storyView.scenario')
            : 'storyView.scenario'
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
        activeIndex.value = 0 // Reset do pierwszego kroku

        // Ustaw tytuł dla pierwszego kroku
        if (conf.steps && conf.steps.length > 0 && conf.steps[0].title) {
            cardTitle.value = conf.steps[0].title
            // Ustaw widok mapy dla pierwszego kroku
            setStoryView({
                feature: conf.steps[0].feature,
                view: conf.steps[0].view,
            })
        } else {
            cardTitle.value = t(conf.title || 'storyView.scenario')
        }
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
