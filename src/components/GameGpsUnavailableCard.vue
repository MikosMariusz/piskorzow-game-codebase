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
        <v-btn
            color="primary"
            elevation="4"
            rounded="sm"
            @click="goToPresentation"
        >
            {{ $t('goToPresentation') }}
        </v-btn>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
    console.log('🚫 GameGpsUnavailableCard mounted!')
})

const goToPresentation = () => {
    console.log('🎯 Going to presentation page')
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
    box-sizing: border-box;
}
</style>
