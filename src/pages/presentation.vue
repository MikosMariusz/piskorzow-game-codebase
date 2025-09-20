<template>
    <CardWrapper
        :visible="true"
        :title="$t('selectTerrainGame')"
        :desktopWidth="400"
        :closable="false"
    >
        <GameStoriesCard />
    </CardWrapper>
</template>

<script setup>
import { onMounted } from 'vue'
import { setStoryView, animateToMode, getDefaultGeometry } from '@/services/olMap'
import CardWrapper from '@/components/CardWrapper.vue'
import GameStoriesCard from '@/components/GameStoriesCard.vue'

onMounted(() => {
    const feature = getDefaultGeometry()
    animateToMode()
    setStoryView({ feature, sidebarWidthPx: 400 })
})
</script>
