<template>
    <div
        ref="mapEl"
        class="app-map-bg"
        :style="{
            zIndex: String(zIndex),
            pointerEvents: interactive ? 'auto' : 'none',
        }"
    />
    <!-- Komponent z licencjami i współrzędnymi - ukryj na stronie głównej -->
    <MapAttributions
        v-if="interactive && !appStore.isHomePage"
        ref="attributionsRef"
    />

    <!-- Przyciski zoom - ukryj na stronie głównej -->
    <MapZoomControls v-if="interactive && !appStore.isHomePage" />

    <!-- Przycisk GPS - ukryj na stronie głównej -->
    <MapGpsControls v-if="interactive && !appStore.isHomePage" />
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
    createMap,
    detach,
    setTarget,
    updateSize,
    animateToMode,
    setClickCallback,
    clearClickCallback,
    clearZoomCallback,
} from '@/services/olMap'
import { useAppStore } from '@/stores/app'
import MapAttributions from './MapAttributions.vue'
import MapZoomControls from './MapZoomControls.vue'
import MapGpsControls from './MapGpsControls.vue'

const props = defineProps({
    interactive: { type: Boolean, default: true },
    zIndex: { type: [Number, String], default: 0 },
    center: { type: Array, default: () => [16.62, 50.69] }, // lon, lat (WGS84)
    zoom: { type: Number, default: 12 },
})

const appStore = useAppStore()
const mapEl = ref(null)
const attributionsRef = ref(null)
let ro = null

onMounted(async () => {
    createMap(mapEl.value, {
        center: undefined,
        zoom: props.zoom,
    })
    await nextTick()
    updateSize()

    // Konfiguracja callbacku dla współrzędnych
    if (attributionsRef.value && props.interactive) {
        setClickCallback((lat, lon) => {
            attributionsRef.value.updateCoordinates(lat, lon)
        })
    }
    ro = new ResizeObserver(() => updateSize())
    ro.observe(mapEl.value)

    window.addEventListener('resize', updateSize, { passive: true })
})

onBeforeUnmount(() => {
    if (ro) ro.disconnect()
    window.removeEventListener('resize', updateSize)
    clearClickCallback()
    clearZoomCallback()
    detach()
})

watch(
    () => mapEl.value,
    (el) => {
        if (el) setTarget(el)
    },
)

watch(
    () => appStore.isHomePage,
    () => animateToMode(),
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
