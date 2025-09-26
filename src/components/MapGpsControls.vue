<template>
    <v-card
        class="map-gps-controls"
        elevation="4"
        rounded="sm"
    >
        <v-card-text class="gps-buttons pa-0">
            <GameButton
                :icon="gpsIcon"
                :action="handleGpsToggle"
                :aria-label="gpsAriaLabel"
                class="gps-button"
                color="''"
                :class="gpsButtonClass"
            />
        </v-card-text>
    </v-card>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import {
    centerMapOn,
    setMoveEndCallback,
    clearMoveEndCallback,
    calculateDistance,
    getMapCenter,
} from '@/services/olMap'
import {
    startGpsTracking,
    stopGpsTracking,
    setGpsPositionCallback,
    clearGpsPositionCallback,
    getCurrentPosition,
} from '@/services/gps'
import { useAppStore } from '@/stores/app'
import GameButton from '@/components/GameButton.vue'

const appStore = useAppStore()
const DISTANCE_THRESHOLD = 100

const checkDistanceFromGps = () => {
    if (appStore.getGpsState !== appStore.GPS_STATE.TRACKING) return

    const currentPos = getCurrentPosition()
    const mapCenter = getMapCenter()

    if (!currentPos || !mapCenter) return

    const [mapLon, mapLat] = mapCenter
    const distance = calculateDistance(currentPos.lat, currentPos.lon, mapLat, mapLon)

    if (distance > DISTANCE_THRESHOLD) {
        appStore.enableGps()
    }
}

const gpsIcon = computed(() => {
    switch (appStore.getGpsState) {
        case appStore.GPS_STATE.DISABLED:
            return 'mdi-crosshairs-off'
        case appStore.GPS_STATE.ENABLED:
            return 'mdi-crosshairs'
        case appStore.GPS_STATE.TRACKING:
            return 'mdi-crosshairs-gps'
        default:
            return 'mdi-crosshairs-off'
    }
})

const gpsAriaLabel = computed(() => {
    switch (appStore.getGpsState) {
        case appStore.GPS_STATE.DISABLED:
            return 'Włącz GPS'
        case appStore.GPS_STATE.ENABLED:
            return 'Włącz śledzenie GPS'
        case appStore.GPS_STATE.TRACKING:
            return 'Wyłącz GPS'
        default:
            return 'GPS'
    }
})

const gpsButtonClass = computed(() => {
    switch (appStore.getGpsState) {
        case appStore.GPS_STATE.ENABLED:
            return 'gps-enabled'
        case appStore.GPS_STATE.TRACKING:
            return 'gps-tracking'
        default:
            return ''
    }
})

const handleGpsToggle = async () => {
    const { createMap } = await import('@/services/olMap')
    const map = createMap()

    switch (appStore.getGpsState) {
        case appStore.GPS_STATE.DISABLED:
            const success = await startGpsTracking(map)
            if (success) {
                appStore.enableGps()
            }
            break
        case appStore.GPS_STATE.ENABLED:
            appStore.startGpsTracking()
            const currentPos = getCurrentPosition()
            if (currentPos) {
                centerMapOn(currentPos.lat, currentPos.lon, 16)
            }
            break
        case appStore.GPS_STATE.TRACKING:
            appStore.disableGps()
            stopGpsTracking(map)
            break
    }
}

onMounted(() => {
    setGpsPositionCallback((lat, lon, accuracy) => {
        if (appStore.getGpsState === appStore.GPS_STATE.TRACKING) {
            centerMapOn(lat, lon, 16)
        }
    })
    setMoveEndCallback(() => {
        checkDistanceFromGps()
    })
})

onBeforeUnmount(() => {
    clearGpsPositionCallback()
    clearMoveEndCallback()

    if (appStore.getGpsState !== appStore.GPS_STATE.DISABLED) {
        import('@/services/olMap').then(({ createMap }) => {
            const map = createMap()
            stopGpsTracking(map)
        })
        appStore.disableGps()
    }
})
</script>

<style scoped>
.map-gps-controls {
    position: fixed;
    top: 162px;
    left: 12px;
    z-index: 1000;
    min-width: auto;
}

.gps-buttons {
    display: flex;
    flex-direction: column;
}

.gps-button {
    min-width: auto !important;
    width: 40px !important;
    height: 40px !important;
    border-radius: 4px !important;
}

.gps-enabled {
    color: #2196f3 !important;
}

.gps-tracking {
    color: #4caf50 !important;
    background-color: rgba(76, 175, 80, 0.1) !important;
}

@media (max-width: 480px) {
    .map-gps-controls {
        top: 158px;
        left: 8px;
    }

    .gps-button {
        width: 36px !important;
        height: 36px !important;
    }
}
</style>
