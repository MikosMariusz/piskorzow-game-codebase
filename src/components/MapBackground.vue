<template>
    <div
        ref="mapEl"
        class="app-map-bg"
        :style="{
            zIndex: String(zIndex),
            pointerEvents: interactive ? 'auto' : 'none',
        }"
    />
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createMap, detach, setTarget, updateSize, animateFilterChange } from '@/services/olMap'
import { useAppStore } from '@/stores/app'

const props = defineProps({
    interactive: { type: Boolean, default: true },
    zIndex: { type: [Number, String], default: 0 }, // tło; treść aplikacji niech ma >0
    center: { type: Array, default: () => [16.62, 50.69] }, // lon, lat (WGS84)
    zoom: { type: Number, default: 12 },
})

const appStore = useAppStore()
const mapEl = ref(null)
let ro = null

const updateMapFilter = () => {
    const isDark = appStore.isDarkEnabled
    const targetFilter = isDark
        ? 'brightness(0.7) contrast(1.2) saturate(0.8) hue-rotate(15deg)'
        : 'none'
    animateFilterChange(targetFilter)
}

onMounted(async () => {
    createMap(mapEl.value, {
        center: undefined,
        zoom: props.zoom,
    })
    await nextTick()
    updateMapFilter()
    updateSize()

    ro = new ResizeObserver(() => updateSize())
    ro.observe(mapEl.value)

    window.addEventListener('resize', updateSize, { passive: true })
})

onBeforeUnmount(() => {
    if (ro) ro.disconnect()
    window.removeEventListener('resize', updateSize)
    detach()
})

watch(
    () => mapEl.value,
    (el) => {
        if (el) setTarget(el)
    },
)

watch(
    () => appStore.isDarkEnabled,
    () => updateMapFilter(),
)
</script>

<style scoped>
.app-map-bg {
    position: fixed;
    inset: 0;
    width: 100dvw;
    height: 100dvh;
    background: transparent;
}
</style>
