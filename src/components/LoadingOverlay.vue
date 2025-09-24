<template>
    <v-overlay
        v-model="isVisible"
        persistent
        class="loading-overlay"
        :scrim="false"
    >
        <v-container
            fluid
            class="loading-container d-flex justify-center align-center pa-0"
        >
            <AppBackground
                :blur="true"
                :brightness="0.7"
            />

            <AppCard
                class="loading-card"
                elevation="8"
                max-width="500"
                width="90%"
                :opacity="0.9"
            >
                <v-card-text class="text-center pa-8">
                    <div class="loading-content">
                        <h2 class="text-h5 font-weight-medium mb-4">
                            {{ $t('loading.initializing') || 'Inicjalizacja aplikacji...' }}
                        </h2>

                        <div class="mb-4 d-flex justify-center align-center">
                            <v-progress-circular
                                indeterminate
                                color="primary"
                                size="48"
                                width="4"
                            ></v-progress-circular>
                        </div>

                        <p class="text-body-1 text-medium-emphasis mb-6">
                            {{ currentStatus }}
                        </p>

                        <v-divider class="mb-4 opacity-50"></v-divider>
                        <v-sheet
                            class="project-logos pa-4 mt-2"
                            elevation="2"
                            rounded="0"
                        >
                            <v-img
                                src="@/assets/images/project-logos.png"
                                alt="Logotypy projektu"
                                class="logos-image"
                                contain
                            />
                        </v-sheet>
                    </div>
                </v-card-text>
            </AppCard>
        </v-container>
    </v-overlay>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import AppCard from './AppCard.vue'
import AppBackground from './AppBackground.vue'

// Stores
const appStore = useAppStore()
const { t } = useI18n()

const currentStatus = ref('')

// Computed properties
const isVisible = computed(() => appStore.getIsLoading)

// Status message keys for translation
const statusMessageKeys = [
    'loading.status.loading',
    'loading.status.components',
    'loading.status.gps',
    'loading.status.map',
    'loading.status.game',
]

// Methods
const updateStatus = () => {
    let messageIndex = 0
    const interval = setInterval(() => {
        if (messageIndex < statusMessageKeys.length && isVisible.value) {
            currentStatus.value = t(statusMessageKeys[messageIndex])
            messageIndex++
        } else {
            clearInterval(interval)
        }
    }, 800)

    // Clean up interval when component is hidden
    watch(isVisible, (newValue) => {
        if (!newValue) {
            clearInterval(interval)
        }
    })
}

// Lifecycle
onMounted(() => {
    if (isVisible.value) {
        updateStatus()
    }
})

// Watch for visibility changes
watch(isVisible, (newValue) => {
    if (newValue) {
        currentStatus.value = t(statusMessageKeys[0])
        updateStatus()
    }
})
</script>

<style scoped lang="scss">
.loading-overlay {
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
}

.loading-container {
    position: relative;
    width: 100vw;
    height: 100vh;
}

.loading-card {
    position: relative;
    z-index: 2;
}

.loading-content {
    animation: fadeIn 0.8s ease-in-out;
}

.project-logos {
    margin-top: 1rem;
}

.logos-image {
    max-width: 100%;
    width: 100%;
    max-height: 200px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.logos-image:hover {
    opacity: 1;
}

/* Responsywność dla logotypów */
@media (max-width: 600px) {
    .logos-image {
        max-height: 80px;
    }

    .project-logos {
        margin-top: 0.5rem;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Transition dla overlay */
.v-overlay__content {
    transition: all 0.3s ease-in-out;
}

/* Zapobiegaj migotaniu podczas ładowania */
.v-overlay--active {
    opacity: 1 !important;
}
</style>
