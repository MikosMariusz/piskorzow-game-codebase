<template></template>

<script setup>
import { useAppStore } from '@/stores/app'
import { setInitialViewForPage, animateToMode } from '@/services/olMap'

const appStore = useAppStore()

onMounted(() => {
    setInitialViewForPage()
    animateToMode()
    appStore.openWindow('game')
})
</script>
