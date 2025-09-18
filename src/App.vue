<template>
    <v-app>
        <LoadingOverlay />
        <CardWrapper
            style="z-index: 3000"
            :visible="appStore.isProjectInfoVisible"
            :title="$t('projectInfo.title')"
            :fullPage="true"
            :minimize="false"
            @update:visible="handleProjectInfoVisibilityChange"
        >
            <ProjectInfoContent />
        </CardWrapper>

        <template v-if="!appStore.getIsLoading">
            <AppBar
                @show-project-info="showProjectInfo"
                @reset-project-info="resetProjectInfo"
            />
            <router-view />
            <MapBackground />
        </template>
    </v-app>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import MapBackground from '@/components/MapBackground.vue'
import ProjectInfoContent from '@/components/ProjectInfoContent.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import CardWrapper from '@/components/CardWrapper.vue'

const appStore = useAppStore()

const handleProjectInfoVisibilityChange = (visible) => {
    if (!visible) {
        appStore.closeProjectInfo()
    }
}

const showProjectInfo = () => {
    appStore.openProjectInfo()
}

const resetProjectInfo = () => {
    appStore.resetProjectInfoDismissal()
    appStore.openProjectInfo()
}

watch(
    () => appStore.getIsLoading,
    (isLoading) => {
        if (!isLoading) {
            appStore.checkAndShowProjectInfo()
        }
    },
)

onMounted(() => {
    if (!appStore.getIsLoading) {
        appStore.checkAndShowProjectInfo()
    }
})

if (typeof window !== 'undefined') {
    window.showProjectInfoDialog = showProjectInfo
    window.resetProjectInfoDialog = resetProjectInfo
}
</script>
