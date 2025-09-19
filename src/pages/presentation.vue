<template>
    <CardWrapper
        :visible="true"
        :title="t('selectTerrainGame')"
        :desktopWidth="400"
        :closable="false"
    >
        <GameStoriesCard />
    </CardWrapper>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { setStoryView, animateToMode, getDefaultGeometry } from '@/services/olMap'
import CardWrapper from '@/components/CardWrapper.vue'
import GameStoriesCard from '@/components/GameStoriesCard.vue'

const appStore = useAppStore()
const { t } = useI18n()

onMounted(() => {
    const featrure = getDefaultGeometry()
    animateToMode()
    setStoryView({ feature: featrure })
    appStore.gameCardVisible = true
})

onUnmounted(() => {
    appStore.gameCardVisible = false
})
</script>
