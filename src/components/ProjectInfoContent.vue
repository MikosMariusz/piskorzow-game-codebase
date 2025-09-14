<template>
    <div class="project-info-content">
        <h2 class="text-h4 font-weight-bold text-primary mb-2">
            {{ $t('projectInfo.title') }}
        </h2>
        <p class="text-subtitle-1 text-secondary mb-4">
            {{ $t('projectInfo.subtitle') }}
        </p>

        <h3 class="text-h5 mb-4 text-primary">
            {{ $t('projectInfo.aboutTitle') }}
        </h3>

        <div class="text-body-1 mb-4 project-description">
            <p class="mb-3">{{ $t('projectInfo.description1') }}</p>
            <p class="mb-3">{{ $t('projectInfo.description2') }}</p>
            <p class="mb-3">{{ $t('projectInfo.description3') }}</p>
        </div>

        <div class="mb-4">
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
        </div>

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

        <!-- Don't show again checkbox -->
        <v-divider class="my-4" />
        <v-checkbox
            v-model="dontShowAgain"
            :label="$t('projectInfo.dontShowAgain')"
            color="primary"
            hide-details
            class="mt-2"
            @update:model-value="handleDontShowAgainChange"
        />
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()
const appStore = useAppStore()

const dontShowAgain = ref(appStore.isProjectInfoDismissed)

// Zapisuj do storage, ale nie zamykaj okna
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
.project-info-content {
    padding: 0;
}

.project-description p {
    text-align: justify;
    line-height: 1.6;
}

/* Responsywność */
@media (max-width: 600px) {
    .project-info-content {
        padding: 0;
    }

    .project-description p {
        text-align: left;
    }
}
</style>
