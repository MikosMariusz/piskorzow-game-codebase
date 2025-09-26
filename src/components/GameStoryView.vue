<template>
    <CardWrapper
        ref="cardWrapperRef"
        :visible="true"
        :title="computedTitle"
        :desktopWidth="600"
        :closable="false"
        :maximized="maximized"
    >
        <template #header-buttons-left>
            <GameButton
                v-if="hasFeatures"
                class="mr-2"
                icon="mdi-map-marker"
                title="storyView.focusStepOnMap"
                :action="focusStepOnMap"
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
        <GameDialog
            v-if="showResumeDialog"
            v-model="showResumeDialog"
            :title-key="'game.resumeDialogTitle'"
            :text-key="'game.resumeDialogText'"
            :confirm-key="'game.resumeDialogContinue'"
            :cancel-key="'game.resumeDialogRestart'"
            @confirm="resumeGame"
            @cancel="restartGame"
        />
        <div
            v-if="config"
            class="story-container"
        >
            <!-- Alert GPS - pozycjonowany absolutnie na górze -->
            <div
                v-if="gpsError"
                class="gps-alert-container"
            >
                <v-alert
                    type="warning"
                    dismissible
                    elevation="4"
                    @input="gpsError = null"
                    class="gps-alert"
                >
                    <div class="font-weight-medium">{{ $t('storyView.gpsAccessRequired') }}</div>
                    <div class="mt-1">{{ gpsError }}</div>
                    <v-row
                        no-gutters
                        class="d-flex mt-2"
                        style="gap: 8px"
                    >
                        <GameButton
                            label="storyView.retryGps"
                            :action="retryGpsAccess"
                        />
                        <GameButton
                            label="goToPresentation"
                            :action="goToPresentation"
                        />
                    </v-row>
                </v-alert>
            </div>
            <div
                class="navigation-buttons"
                v-if="config.steps && config.steps.length > 1 && !isGame"
            >
                <GameButton
                    :disabled="!hasPrev"
                    :action="() => prevStep()"
                    class="nav-btn"
                    icon="mdi-chevron-left"
                    label="storyView.previousStep"
                />
                <span class="step-counter">
                    {{
                        $t('storyView.stepCounter', {
                            current: activeIndex + 1,
                            total: config.steps?.length || 0,
                        })
                    }}
                </span>
                <GameButton
                    :disabled="!hasNext"
                    :action="() => nextStep()"
                    class="nav-btn"
                    label="storyView.nextStep"
                    icon="mdi-chevron-right"
                    right
                />
            </div>
            <GameStep
                :steps="config.steps || []"
                :activeIndex="activeIndex"
                :storyId="storyId"
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
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CardWrapper from '@/components/CardWrapper.vue'
import GameStep from '@/components/GameStep.vue'
import GameDialog from '@/components/GameDialog.vue'
import GameButton from '@/components/GameButton.vue'

import { setStoryView, createMap } from '@/services/olMap'
import {
    startGpsTracking,
    stopGpsTracking,
    checkGpsAccessAndAccuracy,
    setPositionUpdateCallback,
} from '@/services/gps'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const storyId = ref(route.path.split('/').pop())
const loading = ref(true)
const error = ref(null)
const gpsError = ref(null)
const config = ref(null)
const cardTitle = ref('scenario')
const activeIndex = ref(0)
const showResumeDialog = ref(false)
const maximized = ref(false)
const cardWrapperRef = ref(null)
let resumeStepIndex = 0
const { t } = useI18n()
const appStore = useAppStore()

let gpsStarted = false

const hasNext = computed(() => {
    return config.value && config.value.steps && activeIndex.value < config.value.steps.length - 1
})
const hasPrev = computed(() => {
    return activeIndex.value > 0
})
const isGame = computed(() => {
    return route.path.startsWith('/game')
})

const hasFeatures = computed(() => {
    const steps = config.value?.steps
    if (!steps || !Array.isArray(steps)) return false
    const step = steps[activeIndex.value]
    return !!(step && Array.isArray(step.features) && step.features.length > 0)
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
                features: step.features,
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
                features: step.features,
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
        // Sprawdź zapisane postępy
        const key = `gameProgress_${storyId.value}`
        const saved = localStorage.getItem(key)
        if (saved) {
            try {
                const savedProgress = JSON.parse(saved)
                if (
                    typeof savedProgress.stepIndex === 'number' &&
                    savedProgress.stepIndex > 0 &&
                    savedProgress.stepIndex < (conf.steps?.length || 0)
                ) {
                    resumeStepIndex = savedProgress.stepIndex
                    showResumeDialog.value = true
                    // Nie ustawiaj activeIndex, czekaj na wybór użytkownika
                } else {
                    activeIndex.value = 0
                }
            } catch (e) {
                activeIndex.value = 0
            }
        } else {
            activeIndex.value = 0
        }

        // Ustaw tytuł i mapę dla pierwszego kroku (lub po wyborze)
        if (conf.steps && conf.steps.length > 0 && conf.steps[0].title) {
            updateCardTitle(conf.steps[0].title)
            setStoryView({
                features: conf.steps[0].features,
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

const resumeGame = () => {
    activeIndex.value = resumeStepIndex
    showResumeDialog.value = false
    // Ustaw mapę i tytuł dla wznowionego kroku
    const step = config.value?.steps?.[activeIndex.value]
    if (step) {
        updateCardTitle(step.title)
        setStoryView({ features: step.features, view: step.view })
    }
}

const restartGame = () => {
    activeIndex.value = 0
    showResumeDialog.value = false
    // Nadpisz zapis w localStorage
    const key = `gameProgress_${storyId.value}`
    localStorage.setItem(
        key,
        JSON.stringify({
            route: route.fullPath,
            stepIndex: 0,
            storyId: storyId.value,
        }),
    )
    // Ustaw mapę i tytuł dla pierwszego kroku
    const step = config.value?.steps?.[0]
    if (step) {
        updateCardTitle(step.title)
        setStoryView({ features: step.features, view: step.view })
    }
}

const focusStepOnMap = () => {
    if (cardWrapperRef.value) {
        cardWrapperRef.value.offMaximize()
    }
    const step = config.value?.steps?.[activeIndex.value]
    if (step) {
        setStoryView({
            features: step.features,
            view: step.view,
        })
    }
}

/**
 * Automatycznie włącza GPS w trybie ENABLED (pokazuje pozycję bez centrowania)
 */
const initializeGps = async () => {
    try {
        // Sprawdź dostęp do GPS
        const gpsResult = await checkGpsAccessAndAccuracy()

        if (!gpsResult.access) {
            // Ustaw komunikat błędu w zależności od przyczyny
            if (gpsResult.error === 1) {
                // PERMISSION_DENIED
                gpsError.value = t('storyView.gpsPermissionDenied')
            } else if (gpsResult.error === 2) {
                // POSITION_UNAVAILABLE
                gpsError.value = t('storyView.gpsUnavailable')
            } else if (gpsResult.error === 3) {
                // TIMEOUT
                gpsError.value = t('storyView.gpsTimeout')
            } else if (gpsResult.reason?.includes('Accuracy')) {
                if (import.meta.env.DEV) {
                    // W trybie deweloperskim ignoruj niską dokładność dla celów testowych
                    const map = createMap()

                    // Zarejestruj callback dla aktualizacji pozycji w store
                    setPositionUpdateCallback((position) => {
                        appStore.setGpsPosition(position)
                    })

                    const success = await startGpsTracking(map)
                    if (success) {
                        gpsStarted = true
                        gpsError.value = null
                        appStore.enableGps()
                    } else {
                        gpsError.value = t('storyView.gpsStartError')
                    }
                } else {
                    gpsError.value = t('storyView.gpsLowAccuracy', { accuracy: gpsResult.accuracy })
                }
            } else {
                gpsError.value = gpsResult.reason || t('storyView.gpsGenericError')
            }
            return
        }

        // GPS dostępny - włącz w trybie ENABLED (pokazuj pozycję, nie centruj)
        const map = createMap()

        // Zarejestruj callback dla aktualizacji pozycji w store
        setPositionUpdateCallback((position) => {
            appStore.setGpsPosition(position)
        })

        const success = await startGpsTracking(map)

        if (success) {
            gpsStarted = true
            gpsError.value = null
            // Ustaw globalny stan GPS na ENABLED
            appStore.enableGps()
        } else {
            gpsError.value = t('storyView.gpsStartError')
        }
    } catch (err) {
        gpsError.value = t('storyView.gpsGenericError')
        console.error('GPS initialization error:', err)
    }
}

/**
 * Ponowna próba dostępu do GPS
 */
const retryGpsAccess = () => {
    gpsError.value = null
    initializeGps()
}

const goToPresentation = () => {
    router.push('/presentation')
}

onMounted(() => {
    loadConfig()
    // Automatycznie włącz GPS przy wejściu w grę terenową
    initializeGps()
})

onBeforeUnmount(() => {
    // Zatrzymaj GPS przy wyjściu z gry tylko jeśli był uruchomiony przez ten komponent
    if (gpsStarted) {
        const map = createMap()
        stopGpsTracking(map)
        appStore.disableGps()
        gpsStarted = false
    }
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

.gps-alert-container {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    width: 90%;
    max-width: 500px;
}
</style>
