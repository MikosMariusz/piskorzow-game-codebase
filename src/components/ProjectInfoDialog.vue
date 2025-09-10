<template>
    <v-dialog
        v-model="dialog"
        max-width="100vw"
        max-height="100vh"
        persistent
        class="project-info-dialog"
    >
        <AppCard
            class="project-info-card"
            :has-border="false"
            rounded="0"
        >
            <AppBackground />

            <v-card-title class="project-header pa-4">
                <div class="d-flex align-center justify-space-between w-100">
                    <div>
                        <h2 class="text-h4 font-weight-bold text-primary">
                            {{ $t('projectInfo.title') }}
                        </h2>
                        <p class="text-subtitle-1 text-secondary ma-0">
                            {{ $t('projectInfo.subtitle') }}
                        </p>
                    </div>
                    <v-btn
                        icon="mdi-close"
                        variant="text"
                        size="large"
                        @click="closeDialog"
                        class="text-secondary"
                    />
                </div>
            </v-card-title>

            <v-divider />

            <v-card-text class="scrollable-content pa-6">
                <AppCard
                    class="mb-4 pa-4 content-wrapper"
                    :opacity="0.9"
                    style="max-width: 800px"
                >
                    <h3 class="text-h5 mb-4 text-primary">
                        {{ $t('projectInfo.aboutTitle') }}
                    </h3>

                    <div class="text-body-1 mb-4">
                        <p class="mb-3">{{ $t('projectInfo.description1') }}</p>
                        <p class="mb-3">{{ $t('projectInfo.description2') }}</p>
                        <p class="mb-3">{{ $t('projectInfo.description3') }}</p>
                    </div>

                    <v-card-text class="pa-4">
                        <h4 class="text-h6 mb-3 text-primary">
                            {{ $t('projectInfo.fundingTitle') }}
                        </h4>
                        <div class="d-flex align-center mb-2">
                            <v-icon
                                icon="mdi-european-union"
                                class="me-2 text-primary"
                            />
                            <span class="text-body-2">{{ $t('projectInfo.euFunding') }}</span>
                        </div>
                        <div class="d-flex align-center mb-2">
                            <v-icon
                                icon="mdi-calendar"
                                class="me-2 text-primary"
                            />
                            <span class="text-body-2">{{ $t('projectInfo.projectPeriod') }}</span>
                        </div>
                        <div class="d-flex align-center">
                            <v-icon
                                icon="mdi-map-marker"
                                class="me-2 text-primary"
                            />
                            <span class="text-body-2">{{ $t('projectInfo.location') }}</span>
                        </div>
                    </v-card-text>

                    <h4 class="text-h6 mb-3 text-primary">
                        {{ $t('projectInfo.objectivesTitle') }}
                    </h4>
                    <v-list class="bg-transparent pa-0">
                        <v-list-item
                            v-for="(objective, index) in objectives"
                            :key="index"
                            class="pa-2"
                        >
                            <template #prepend>
                                <v-icon
                                    icon="mdi-check-circle"
                                    class="text-success me-3"
                                />
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ objective }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </AppCard>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-2">
                <v-checkbox
                    v-model="dontShowAgain"
                    :label="$t('projectInfo.dontShowAgain')"
                    color="primary"
                    hide-details
                    class="me-4"
                />

                <v-spacer />
            </v-card-actions>
        </AppCard>
    </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import AppCard from './AppCard.vue'
import AppBackground from './AppBackground.vue'

// Props
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
})

// Emits
const emit = defineEmits(['update:modelValue', 'close', 'start-exploring'])

// Composables
const { t } = useI18n()
const appStore = useAppStore()

// Reactive data
const dontShowAgain = ref(localStorage.getItem('projectInfoDialogDismissed') === 'true')

// Computed
const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})

const objectives = computed(() => [
    t('projectInfo.objective1'),
    t('projectInfo.objective2'),
    t('projectInfo.objective3'),
    t('projectInfo.objective4'),
])

// Watchers
watch(dontShowAgain, (newValue) => {
    if (newValue) {
        localStorage.setItem('projectInfoDialogDismissed', 'true')
    } else {
        localStorage.removeItem('projectInfoDialogDismissed')
    }
})

// Methods
const closeDialog = () => {
    dialog.value = false
    emit('close')
}

const startExploring = () => {
    dialog.value = false
    emit('start-exploring')
}

// Check if dialog should be shown on mount
const shouldShowDialog = () => {
    return !localStorage.getItem('projectInfoDialogDismissed')
}

// Reset dialog state (useful for testing)
const resetDialogState = () => {
    localStorage.removeItem('projectInfoDialogDismissed')
} // Lifecycle
onMounted(() => {
    // Jeśli loading już się zakończył, sprawdź czy pokazać dialog
    if (!appStore.getIsLoading && shouldShowDialog()) {
        dialog.value = true
    }
})

// Watch for loading state changes
watch(
    () => appStore.getIsLoading,
    (isLoading) => {
        // Gdy loading się zakończy, sprawdź czy pokazać dialog
        if (!isLoading && shouldShowDialog()) {
            dialog.value = true
        }
    },
)

// Expose method to parent component
defineExpose({
    shouldShowDialog,
    resetDialogState,
    showDialog: () => {
        dialog.value = true
    },
})
</script>

<style scoped>
.project-info-dialog :deep(.v-overlay__content) {
    margin: 0;
    height: 100vh;
    width: 100vw;
}

.project-info-dialog :deep(.v-overlay__scrim) {
    z-index: 9998;
}

.project-info-dialog :deep(.v-overlay__content) {
    z-index: 9998;
}

.project-info-card {
    height: 100vh;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.project-header {
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(var(--v-theme-primary), 0.2);
    flex-shrink: 0;
}

.project-info-card :deep(.v-card-actions) {
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(var(--v-theme-primary), 0.2);
    flex-shrink: 0;
}

.scrollable-content {
    flex: 1;
    position: relative;
    z-index: 2;
    background: transparent;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content-wrapper {
    max-width: 800px;
    max-height: calc(100vh - 200px);
    margin: 0 auto;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    overflow-y: auto;
}

.project-description {
    line-height: 1.6;
}

.project-description p {
    text-align: justify;
}

/* Responsywność */
@media (max-width: 960px) {
    .project-info-dialog :deep(.v-overlay__content) {
        margin: 0;
        height: 100vh;
        width: 100vw;
    }

    .project-info-card {
        height: 100vh;
        max-height: 100vh;
    }

    .project-header .text-h4 {
        font-size: 1.5rem !important;
    }

    .content-wrapper {
        padding: 1.5rem 1rem;
    }
}

@media (max-width: 600px) {
    .project-header {
        padding: 1rem !important;
    }

    .project-header .d-flex {
        flex-direction: column;
        align-items: flex-start !important;
    }

    .project-header .v-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }

    .project-header .text-h4 {
        font-size: 1.25rem !important;
    }

    .content-wrapper {
        padding: 1rem 0.5rem;
    }
}
</style>
