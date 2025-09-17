<template>
    <CardWrapper
        :visible="showCard"
        :title="cardTitle"
        :desktopWidth="cardWidth"
        :centered="centered"
        :closable="hasGpsAccess"
        @update:visible="onClose"
    >
        <GameGpsUnavailableCard v-if="!hasGpsAccess" />
        <GameStoriesCard v-else />
    </CardWrapper>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import CardWrapper from '@/components/CardWrapper.vue'
import GameStoriesCard from '@/components/GameStoriesCard.vue'
import { setInitialViewForPage, animateToMode } from '@/services/olMap'

const appStore = useAppStore()

const showCard = ref(false)
const hasGpsAccess = ref(false)
const cardTitle = ref('Dostępne gry terenowe')
const cardWidth = ref(600)
const centered = ref(false)

onMounted(async () => {
    console.log('🎮 game.vue onMounted - start')

    // Sprawdź GPS tylko przy wejściu na /game
    const gpsResult = await appStore.checkGpsAccess()

    console.log('📍 GPS result on /game page:', gpsResult)

    if (!gpsResult.access) {
        console.log('❌ GPS not available - showing GameGpsUnavailableCard')
        hasGpsAccess.value = false
        cardTitle.value = 'Moduł gry terenowej niedostępny'
        cardWidth.value = 500
        centered.value = true // CardWrapper zdecyduje czy wyśrodkować na podstawie rozmiaru ekranu
        // Wymuś ciemny filtr mapy i animację lotu, ustaw pozycję startową
        animateToMode({ forceDark: true, forceFlight: true, setStartView: true })
    } else {
        console.log('✅ GPS available - showing GameStoriesCard')
        hasGpsAccess.value = true
        cardTitle.value = 'Dostępne gry terenowe'
        cardWidth.value = 600
        centered.value = false
        // Przywróć normalny filtr mapy, wyłącz animację lotu, ustaw pozycję startową
        animateToMode({ forceDark: false, forceFlight: false, setStartView: true })
    }

    console.log('🔧 Setting showCard to true')
    // Pokaż okno po ustawieniu wszystkich parametrów
    showCard.value = true
    console.log('🎮 game.vue onMounted - end')
})

const onClose = () => {
    showCard.value = false
}
</script>
