<template></template>

<script setup>
import { useAppStore } from '@/stores/app'
import { setInitialViewForPage } from '@/services/olMap'

const appStore = useAppStore()

onMounted(() => {
    setInitialViewForPage()
    appStore.openWindow('game')
})
</script>
