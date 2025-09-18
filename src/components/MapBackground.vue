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
        <!-- Komponent z licencjami i współrzędnymi - ukryj na stronie głównej -->
        <MapAttributions
            v-if="isInteractive && !appStore.isHomePage"
            ref="attributionsRef"
        />

        <!-- Przyciski zoom - ukryj na stronie głównej -->
        <MapZoomControls v-if="isInteractive && !appStore.isHomePage" />

        <!-- Przycisk GPS - ukryj na stronie głównej -->
        <MapGpsControls v-if="isInteractive && !appStore.isHomePage" />
    </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute } from 'vue-router'
import {
    createMap,
    detach,
    setTarget,
    updateSize,
    setClickCallback,
    clearClickCallback,
    clearZoomCallback,
    setInitialViewForPage,
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
const route = useRoute()
let ro = null

const { smAndDown } = useDisplay()

// Wysokość karty na mobile (zgodnie z CardWrapper: 50vh)
const CARD_HEIGHT_VH = 50

// Interaktywność mapy zależna od strony i dostępu do GPS
const isInteractive = computed(() => {
    if (appStore.isHomePage) return false
    // Tylko strona /game wymaga GPS - /presentation może działać bez GPS
    if (window.location.pathname.startsWith('/game') && !appStore.hasGpsAccess) return false
    return props.interactive
})

// Dynamiczna wysokość mapy na mobile, gdy karta jest widoczna
const mapHeight = computed(() => {
    return smAndDown.value && appStore.gameCardVisible
        ? `calc(100vh - ${CARD_HEIGHT_VH}vh)`
        : '100vh'
})

// Watch zmiany wysokości mapy i aktualizuj rozmiar OpenLayers
watch(mapHeight, () => {
    if (mapEl.value) {
        updateSize()
    }
})

// Watch zmiany breakpoint dla aktualizacji mapy i pozycji
watch(smAndDown, () => {
    if (mapEl.value) {
        updateSize()

        // Przy zmianie z mobile na desktop lub odwrotnie, dostosuj pozycję
        const path = window.location.pathname
        const isGameOrPresentation = path.startsWith('/game') || path.startsWith('/presentation')

        if (isGameOrPresentation && appStore.gameCardVisible) {
            setTimeout(() => setInitialViewForPage(), 100)
        }
    }
})

// Watch widoczności karty - ustaw flagę aktywności komponentów gry
watch(
    () => appStore.gameCardVisible,
    () => {
        // Przy zmianie widoczności karty aktualizujemy rozmiar mapy
        if (mapEl.value) {
            updateSize()
        }
    },
    { immediate: true },
)

onMounted(async () => {
    createMap(mapEl.value, {
        center: undefined,
        zoom: props.zoom,
    })
    await nextTick()
    updateSize()

    // Konfiguracja callbacku dla współrzędnych
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
    /* height ustawiana inline przez :style - zastępuje bottom gdy karta jest widoczna */
}
</style>
