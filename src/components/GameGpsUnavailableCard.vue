<template>
    <div class="gps-unavailable-center">
        <v-icon
            color="error"
            size="64"
            class="mb-4"
            >mdi-map-off</v-icon
        >
        <h2 class="mb-2 text-h6">Moduł gry terenowej jest niedostępny</h2>
        <div class="mb-4 text-body-1">
            Niestety na Twoim urządzeniu nie można uruchomić gry terenowej. Możesz przejść do trybu
            prezentacji.
        </div>
        <v-btn
            color="primary"
            variant="elevated"
            @click="goToPresentation"
        >
            Przejdź do prezentacji
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
    min-height: 260px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px 20px 28px 20px;
    box-sizing: border-box;
}
</style>
