<template>
    <v-card
        class="map-zoom-controls"
        elevation="4"
        rounded="sm"
    >
        <v-card-text class="zoom-buttons pa-0">
            <v-btn
                variant="text"
                size="small"
                density="compact"
                icon="mdi-plus"
                @click="handleZoomIn"
                :disabled="isMaxZoom"
                :aria-label="'Przybliż mapę'"
                class="zoom-button"
            />

            <v-divider />

            <v-btn
                variant="text"
                size="small"
                density="compact"
                icon="mdi-minus"
                @click="handleZoomOut"
                :disabled="isMinZoom"
                :aria-label="'Oddal mapę'"
                class="zoom-button"
            />
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
    zoomIn,
    zoomOut,
    getCurrentZoom,
    setZoomCallback,
    clearZoomCallback,
} from '@/services/olMap'

const currentZoom = ref(12)
const minZoom = 1
const maxZoom = 20

const isMinZoom = computed(() => currentZoom.value <= minZoom)
const isMaxZoom = computed(() => currentZoom.value >= maxZoom)

const handleZoomIn = () => {
    zoomIn()
}

const handleZoomOut = () => {
    zoomOut()
}

const updateZoomLevel = (zoom) => {
    if (zoom !== null && zoom !== undefined) {
        currentZoom.value = Math.round(zoom * 10) / 10 // Zaokrąglenie do 1 miejsca po przecinku
    }
}

onMounted(() => {
    // Inicjalne ustawienie poziomu zoom
    const initialZoom = getCurrentZoom()
    updateZoomLevel(initialZoom)

    // Rejestracja callback'a dla zmian zoom
    setZoomCallback(updateZoomLevel)
})

onBeforeUnmount(() => {
    clearZoomCallback()
})
</script>

<style scoped>
.map-zoom-controls {
    position: fixed;
    top: 72px; /* Tuż pod v-app-bar (64px + 8px margin) */
    left: 8px;
    z-index: 1000;
    min-width: auto;
}

.zoom-buttons {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.zoom-button {
    min-width: auto !important;
    width: 40px !important;
    height: 40px !important;
    border-radius: 0 !important;
}

.zoom-button:first-child {
    border-top-left-radius: 4px !important;
    border-top-right-radius: 4px !important;
}

.zoom-button:last-child {
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
}

/* Responsive */
@media (max-width: 480px) {
    .map-zoom-controls {
        top: 70px;
        left: 8px;
    }

    .zoom-button {
        width: 36px !important;
        height: 36px !important;
    }
}
</style>
