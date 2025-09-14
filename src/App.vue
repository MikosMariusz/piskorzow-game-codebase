<template>
    <v-app>
        <!-- Loading overlay component - pokazuj jako pierwszy -->
        <LoadingOverlay />

        <!-- Project Info Dialog - zawsze renderowany -->
        <ProjectInfoDialog
            ref="projectInfoDialog"
            v-model="showProjectInfo"
            @close="handleDialogClose"
            @start-exploring="handleStartExploring"
        />

        <!-- Game Card - używamy CardWrapper z GameCard jako slot -->
        <CardWrapper
            :visible="appStore.isGameCardVisible"
            :title="$t('gameCard.title')"
            @update:visible="appStore.setGameCardVisible"
        >
            <GameCard />
        </CardWrapper>

        <!-- Komponenty aplikacji - ukryj podczas ładowania -->
        <template v-if="!appStore.getIsLoading">
            <AppBar
                @show-project-info="showDialog"
                @reset-project-info="resetDialog"
            />
            <router-view />
            <MapBackground />
        </template>
    </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import MapBackground from '@/components/MapBackground.vue'
import ProjectInfoDialog from '@/components/ProjectInfoDialog.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import CardWrapper from '@/components/CardWrapper.vue'
import GameCard from '@/components/GameCard.vue'

// Composables
const router = useRouter()
const appStore = useAppStore()

// Reactive data
const showProjectInfo = ref(false)
const projectInfoDialog = ref(null)

// Methods
const handleDialogClose = () => {
    showProjectInfo.value = false
}

const handleStartExploring = () => {
    showProjectInfo.value = false
    // Przekieruj do gry terenowej lub głównej strony z mapą
    if (router.currentRoute.value.path === '/') {
        // Już jesteśmy na głównej stronie
        return
    }
    router.push('/')
}

// Expose method to show dialog manually (useful for testing or manual trigger)
const showDialog = () => {
    if (projectInfoDialog.value) {
        projectInfoDialog.value.showDialog()
    }
}

// Reset dialog state
const resetDialog = () => {
    if (projectInfoDialog.value) {
        projectInfoDialog.value.resetDialogState()
        showDialog()
    }
}

// Lifecycle
onMounted(() => {
    // Dialog automatycznie sprawdzi czy ma się pokazać
    // na podstawie localStorage w swoim mounted hook
})

// Make showDialog available globally for debugging
if (typeof window !== 'undefined') {
    window.showProjectInfoDialog = showDialog
}
</script>
