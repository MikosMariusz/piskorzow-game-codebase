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

// Próg dystansu w metrach - jeśli użytkownik oddali się o więcej niż 100m od pozycji GPS
const DISTANCE_THRESHOLD = 100

/**
 * Sprawdza czy użytkownik oddalił się od pozycji GPS i zmienia stan z TRACKING na ENABLED
 */
const checkDistanceFromGps = () => {
    if (appStore.getGpsState !== appStore.GPS_STATE.TRACKING) return

    const currentPos = getCurrentPosition()
    const mapCenter = getMapCenter()

    if (!currentPos || !mapCenter) return

    const [mapLon, mapLat] = mapCenter
    const distance = calculateDistance(currentPos.lat, currentPos.lon, mapLat, mapLon)

    // Jeśli użytkownik oddalił się od pozycji GPS, zmień stan na ENABLED
    if (distance > DISTANCE_THRESHOLD) {
        appStore.enableGps()
    }
}

const gpsIcon = computed(() => {
    switch (appStore.getGpsState) {
        case appStore.GPS_STATE.DISABLED:
            return 'mdi-crosshairs-off'
        case appStore.GPS_STATE.ENABLED:
            return 'mdi-crosshairs' // Zamienione z TRACKING
        case appStore.GPS_STATE.TRACKING:
            return 'mdi-crosshairs-gps' // Zamienione z ENABLED
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
    // Pobierz istniejącą instancję mapy
    const { createMap } = await import('@/services/olMap')
    const map = createMap() // Funkcja zwraca istniejącą mapę lub tworzy nową jeśli nie istnieje

    switch (appStore.getGpsState) {
        case appStore.GPS_STATE.DISABLED:
            // Przejdź do stanu ENABLED - pokaż pozycję GPS
            const success = await startGpsTracking(map)
            if (success) {
                appStore.enableGps()
            }
            break
        case appStore.GPS_STATE.ENABLED:
            // Przejdź do stanu TRACKING - śledź pozycję GPS
            appStore.startGpsTracking()
            // Jeśli mamy aktualną pozycję, wycentruj mapę
            const currentPos = getCurrentPosition()
            if (currentPos) {
                centerMapOn(currentPos.lat, currentPos.lon, 16) // Duże ale rozsądne przybliżenie
            }
            break
        case appStore.GPS_STATE.TRACKING:
            // Przejdź do stanu DISABLED - wyłącz GPS
            appStore.disableGps()
            stopGpsTracking(map)
            break
    }
}

onMounted(() => {
    // Rejestracja callback'a dla pozycji GPS w trybie TRACKING
    setGpsPositionCallback((lat, lon, accuracy) => {
        if (appStore.getGpsState === appStore.GPS_STATE.TRACKING) {
            // Automatycznie centruj mapę na pozycji GPS w trybie śledzenia
            centerMapOn(lat, lon, 16)
        }
    })

    // Rejestracja callback'a dla ruchu mapy - sprawdza dystans od GPS
    setMoveEndCallback(() => {
        checkDistanceFromGps()
    })
})

onBeforeUnmount(() => {
    clearGpsPositionCallback()
    clearMoveEndCallback()

    // Zatrzymaj śledzenie GPS przy odmontowaniu komponentu
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
    top: 158px; /* Pod zoom controls (72px + 40px + 40px + 6px + 6px) */
    left: 8px;
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
    color: #2196f3 !important; /* Niebieski dla GPS włączonego */
}

.gps-tracking {
    color: #4caf50 !important; /* Zielony dla GPS śledzonego */
    background-color: rgba(76, 175, 80, 0.1) !important;
}

/* Responsive */
@media (max-width: 480px) {
    .map-gps-controls {
        top: 158px; /* Zaktualizowane: 80px (AppBar + margin) + 36px + 36px + 6px = 158px */
        left: 8px;
    }

    .gps-button {
        width: 36px !important;
        height: 36px !important;
    }
}
</style>
