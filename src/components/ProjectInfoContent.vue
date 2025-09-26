<template>
    <v-container
        fluid
        :class="containerClass"
    >
        <v-row
            no-gutters
            class="project-info-row"
        >
            <v-col
                md="6"
                cols="12"
                :class="['pa-6', scrollClass]"
            >
                <h3 class="text-h6 mb-3 text-primary">
                    {{ $t('projectInfo.aboutTitle') }}
                </h3>

                <div class="text-body-2 mb-4 project-description">
                    <p class="mb-3">{{ $t('projectInfo.description1') }}</p>
                    <p class="mb-3">{{ $t('projectInfo.description2') }}</p>
                    <p class="mb-3">{{ $t('projectInfo.description3') }}</p>
                </div>
                <v-divider class="my-4" />
                <div class="mb-4">
                    <h4 class="text-h6 mb-3 text-primary">
                        {{ $t('projectInfo.fundingTitle') }}
                    </h4>
                    <div class="text-body-2 mb-4 project-description">
                        <p class="mb-3">{{ $t('projectInfo.euFunding') }}</p>
                    </div>
                </div>
                <v-divider class="my-4" />
                <div class="mb-4">
                    <h4 class="text-h6 mb-3 text-primary">
                        {{ $t('projectInfo.contactTitle') }}
                    </h4>
                    <div class="text-body-2 mb-4 project-description">
                        <p class="mb-3">{{ $t('projectInfo.contactText') }}</p>
                    </div>
                    <div class="d-flex align-center mb-2">
                        <v-icon
                            icon="mdi-email-outline"
                            class="me-2 text-primary"
                        />
                        <a
                            href="mailto:kontakt@wies20.pl"
                            class="text-primary text-decoration-underline ms-1"
                            >kontakt@wies20.pl</a
                        >
                    </div>
                </div>
                <v-divider class="my-4" />
                <v-checkbox
                    v-model="dontShowAgain"
                    :label="$t('projectInfo.dontShowAgain')"
                    color="primary"
                    hide-details
                    class="mt-2"
                />
            </v-col>
            <v-col
                md="6"
                cols="12"
                class="pa-6 ma-0 position-relative d-flex align-center justify-center project-visual-col"
            >
                <AppBackground
                    :blur="false"
                    :brightness="0.7"
                />
                <app-card
                    elevation="2"
                    :opacity="0.9"
                    class="pa-4 project-logos"
                >
                    <v-img
                        src="@/assets/images/project-logos.png"
                        alt="Logotypy projektu"
                        height="200"
                        width="100%"
                        class="logos-image"
                        contain
                    />
                    <a
                        href="https://wies20.pl"
                        target="_blank"
                        rel="noopener"
                        class="logos-text text-primary text-decoration-underline"
                    >
                        {{ $t('projectInfo.logosText') }}
                    </a>
                </app-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import AppBackground from './AppBackground.vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

const isMobile = ref(false)
if (typeof window !== 'undefined') {
    const checkMobile = () => {
        isMobile.value = window.innerWidth <= 959
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
}

const containerClass = computed(() =>
    isMobile.value ? 'project-info-content-mobile' : 'project-info-content',
)
const scrollClass = computed(() =>
    isMobile.value ? 'project-info-scroll-mobile' : 'project-info-scroll',
)

const { t } = useI18n()
const appStore = useAppStore()

const dontShowAgain = ref(appStore.isProjectInfoDismissed)

watch(dontShowAgain, (value) => {
    if (value) {
        appStore.dismissProjectInfo(true)
    } else {
        appStore.resetProjectInfoDismissal()
    }
})

const objectives = computed(() => [
    t('projectInfo.objective1'),
    t('projectInfo.objective2'),
    t('projectInfo.objective3'),
    t('projectInfo.objective4'),
])
</script>

<style scoped>
.project-logos {
    max-width: 600px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 2;
}

.logos-image:hover {
    opacity: 1;
}

.project-info-content {
    padding: 0;
    overflow: hidden;
    height: calc(100vh - 153px);
}

.project-info-content-mobile {
    padding: 0;
    height: auto;
    min-height: 0;
    overflow-y: visible;
    overflow-x: visible;
}

.project-info-scroll {
    height: calc(100vh - 153px);
    max-height: calc(100vh - 153px);
    overflow-y: auto;
    overflow-x: visible;
}

.project-info-scroll-mobile {
    height: auto;
    max-height: none;
    overflow: visible;
}

.project-description p {
    text-align: justify;
    line-height: 1.6;
}

@media (max-width: 959px) {
    .project-info-row {
        height: auto;
        min-height: 0;
        flex-direction: column !important;
    }
    .project-visual-col {
        min-height: 220px;
        height: auto !important;
        margin-top: 24px;
        margin-bottom: 24px;
    }
    .v-col {
        height: auto !important;
        min-height: 0 !important;
    }
}

@media (max-width: 600px) {
    .project-info-content {
        padding: 0;
    }

    .project-description p {
        text-align: left;
    }
}
</style>
