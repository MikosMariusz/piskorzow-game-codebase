<template>
    <CardWrapper
        v-if="!hasGpsAccess"
        :visible="true"
        :title="cardTitle"
        :desktopWidth="500"
        :centered="true"
        :closable="false"
        :minimize="false"
    >
        <GameGpsUnavailableCard />
    </CardWrapper>
    <CardWrapper
        v-else
        :visible="true"
        :title="cardTitle"
        :desktopWidth="400"
        :closable="false"
    >
        <GameStoriesCard />
    </CardWrapper>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import CardWrapper from '@/components/CardWrapper.vue'
import GameGpsUnavailableCard from '@/components/GameGpsUnavailableCard.vue'
import { animateToMode, getDefaultGeometry, setStoryView } from '@/services/olMap'

const appStore = useAppStore()
const { t } = useI18n()
const hasGpsAccess = ref(false)
const cardTitle = ref(t('terrainGameModuleUnavailable'))

onMounted(async () => {
    const gpsResult = await appStore.checkGpsAccess()
    if (!gpsResult.access) {
        hasGpsAccess.value = false
        cardTitle.value = t('terrainGameModuleUnavailable')
        animateToMode({ forceDark: true, forceFlight: true, setStartView: true })
        const feature = getDefaultGeometry()
        setStoryView({ feature })
    } else {
        hasGpsAccess.value = true
        cardTitle.value = t('selectTerrainGame')
        const feature = getDefaultGeometry()
        animateToMode()
        setStoryView({ feature })
    }
})
</script>
