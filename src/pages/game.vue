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
    <CardWrapper
        v-else
        :visible="true"
        :title="cardTitle"
        :desktopWidth="500"
        :closable="false"
    >
        <GameStoriesCard />
    </CardWrapper>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import CardWrapper from '@/components/CardWrapper.vue'
import GameGpsUnavailableCard from '@/components/GameGpsUnavailableCard.vue'
import { animateToMode } from '@/services/olMap'

const appStore = useAppStore()
const { t } = useI18n()
const hasGpsAccess = ref(false)
const cardTitle = ref(t('terrainGameModuleUnavailable'))

onMounted(async () => {
    // Ustaw kartę jako widoczną przy wejściu na stronę gry
    appStore.gameCardVisible = true

    const gpsResult = await appStore.checkGpsAccess()
    if (!gpsResult.access) {
        hasGpsAccess.value = false
        cardTitle.value = t('terrainGameModuleUnavailable')
        animateToMode({ forceDark: true, forceFlight: true, setStartView: true })
    } else {
        hasGpsAccess.value = true
        cardTitle.value = t('selectTerrainGame')
        animateToMode({ forceDark: false, forceFlight: false, setStartView: true, zoom: 14 })
    }
})

onUnmounted(() => {
    // Ukryj kartę przy opuszczeniu strony gry
    appStore.gameCardVisible = false
})
</script>
