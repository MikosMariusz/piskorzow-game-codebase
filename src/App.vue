<template>
    <v-app>
        <LoadingOverlay />
        <CardWrapper
            :visible="appStore.isProjectInfoVisible"
            :title="$t('projectInfo.title')"
            :fullPage="true"
            @update:visible="handleProjectInfoVisibilityChange"
        >
            <ProjectInfoContent />
        </CardWrapper>

        <CardWrapper
            :visible="appStore.isGameCardVisible"
            :title="$t('gameCard.title')"
            @update:visible="handleGameCardVisibilityChange"
        >
            <GameCard />
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
import GameCard from '@/components/GameCard.vue'

const appStore = useAppStore()

const handleProjectInfoVisibilityChange = (visible) => {
    if (!visible) {
        appStore.closeProjectInfo()
    }
}

const handleGameCardVisibilityChange = (visible) => {
    if (visible) {
        appStore.openWindow('game')
    } else {
        appStore.closeWindow()
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
