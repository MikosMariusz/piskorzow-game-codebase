<template>
    <div class="gps-unavailable-center pa-4">
        <v-icon
            color="primary"
            size="64"
            class="mb-4"
            >mdi-crosshairs-question</v-icon
        >
        <h2 class="mb-2 text-h6">{{ $t('terrainGameModuleUnavailable') }}</h2>
        <div class="mb-4 text-body-1">
            {{ $t('terrainGameUnavailableDescription') }}
        </div>
        <GameButton
            :action="goToPresentation"
            :label="'goToPresentation'"
        />
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import GameButton from '@/components/GameButton.vue'

const router = useRouter()

const goToPresentation = () => {
    router.push('/presentation')
}
</script>

<style scoped>
.gps-unavailable-center {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}
</style>
