<template>
    <CardWrapper
        v-if="!hasGpsAccess"
        :visible="true"
        :title="cardTitle"
        :desktopWidth="600"
        :centered="true"
        :closable="false"
    >
        <GameGpsUnavailableCard />
    </CardWrapper>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useAppStore } from '@/stores/app'
import CardWrapper from '@/components/CardWrapper.vue'
import GameGpsUnavailableCard from '@/components/GameGpsUnavailableCard.vue'
import { animateToMode } from '@/services/olMap'

const appStore = useAppStore()
const hasGpsAccess = ref(false)
const cardTitle = ref('Dostępne gry terenowe')

onBeforeMount(async () => {
    const gpsResult = await appStore.checkGpsAccess()
    if (!gpsResult.access) {
        hasGpsAccess.value = false
        cardTitle.value = 'Moduł gry terenowej niedostępny'
        cardWidth.value = 500
        centered.value = true
        animateToMode({ forceDark: true, forceFlight: true, setStartView: true })
    }
})
</script>
