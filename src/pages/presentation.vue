<template>
    <CardWrapper
        :visible="true"
        :title="t('selectTerrainGame')"
        :desktopWidth="500"
        :closable="false"
    >
        <GameStoriesCard />
    </CardWrapper>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { setInitialViewForPage, animateToMode } from '@/services/olMap'
import CardWrapper from '@/components/CardWrapper.vue'
import GameStoriesCard from '@/components/GameStoriesCard.vue'

const appStore = useAppStore()
const { t } = useI18n()

onMounted(() => {
    // Ustaw kartę jako widoczną przy wejściu na stronę prezentacji
    appStore.gameCardVisible = true

    setInitialViewForPage()
    animateToMode()
    appStore.openWindow('game')
})

onUnmounted(() => {
    // Ukryj kartę przy opuszczeniu strony prezentacji
    appStore.gameCardVisible = false
})
</script>
