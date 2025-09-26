<template>
    <div
        ref="mapEl"
        class="app-map-bg"
        :style="{
            zIndex: String(zIndex),
            pointerEvents: isInteractive ? 'auto' : 'none',
            height: mapHeight,
        }"
    >
        <MapAttributions
            v-if="isInteractive && !appStore.isHomePage"
            ref="attributionsRef"
        />
        <MapZoomControls v-if="isInteractive && !appStore.isHomePage" />
        <MapGpsControls v-if="isInteractive && !appStore.isHomePage" />
    </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import {
    createMap,
    detach,
    setTarget,
    updateSize,
    setClickCallback,
    clearClickCallback,
    clearZoomCallback,
    animateToMode,
} from '@/services/olMap'
import { useAppStore } from '@/stores/app'
import MapAttributions from './MapAttributions.vue'
import MapZoomControls from './MapZoomControls.vue'
import MapGpsControls from './MapGpsControls.vue'

const props = defineProps({
    interactive: { type: Boolean, default: true },
    zIndex: { type: [Number, String], default: 0 },
    center: { type: Array, default: () => [16.62, 50.69] },
    zoom: { type: Number, default: 12 },
})

const appStore = useAppStore()
const mapEl = ref(null)
const attributionsRef = ref(null)
let ro = null

const { smAndDown } = useDisplay()

const CARD_HEIGHT_VH = 50

const isInteractive = computed(() => {
    if (appStore.isHomePage) return false
    if (window.location.pathname.startsWith('/game') && !appStore.hasGpsAccess) return false
    return props.interactive
})

const mapHeight = computed(() => {
    return smAndDown.value && appStore.gameCardVisible
        ? `calc(100vh - ${CARD_HEIGHT_VH}vh)`
        : '100vh'
})

watch(mapHeight, () => {
    if (mapEl.value) {
        updateSize()
    }
})

watch(smAndDown, () => {
    if (mapEl.value) {
        updateSize()
    }
})

onMounted(async () => {
    createMap(mapEl.value, {
        center: undefined,
        zoom: props.zoom,
    })
    await nextTick()
    updateSize()
    ro = new ResizeObserver(() => updateSize())
    ro.observe(mapEl.value)
    window.addEventListener('resize', updateSize, { passive: true })
    setClickCallback((lat, lon) => {
        if (isInteractive.value && attributionsRef.value) {
            attributionsRef.value.updateCoordinates(lat, lon)
        }
    })
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
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100dvw;
    background: transparent;
}
</style>
