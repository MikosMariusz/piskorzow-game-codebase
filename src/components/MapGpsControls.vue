<template>
    <v-card
        class="map-gps-controls"
        elevation="4"
        rounded="sm"
    >
        <v-card-text class="gps-buttons pa-0">
            <v-btn
                variant="text"
                size="small"
                density="compact"
                :icon="gpsIcon"
                @click="handleGpsToggle"
                :aria-label="gpsAriaLabel"
                class="gps-button"
                :class="gpsButtonClass"
            />
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

// GPS states
const GPS_STATE = {
    DISABLED: 0, // GPS wyłączony
    ENABLED: 1, // GPS włączony - pokazuje pozycję
    TRACKING: 2, // GPS śledzony - centruje mapę na pozycji
}

const gpsState = ref(GPS_STATE.DISABLED)

// Próg dystansu w metrach - jeśli użytkownik oddali się o więcej niż 100m od pozycji GPS
const DISTANCE_THRESHOLD = 100

/**
 * Sprawdza czy użytkownik oddalił się od pozycji GPS i zmienia stan z TRACKING na ENABLED
 */
const checkDistanceFromGps = () => {
    if (gpsState.value !== GPS_STATE.TRACKING) return

    const currentPos = getCurrentPosition()
    const mapCenter = getMapCenter()

    if (!currentPos || !mapCenter) return

    const [mapLon, mapLat] = mapCenter
    const distance = calculateDistance(currentPos.lat, currentPos.lon, mapLat, mapLon)

    // Jeśli użytkownik oddalił się od pozycji GPS, zmień stan na ENABLED
    if (distance > DISTANCE_THRESHOLD) {
        gpsState.value = GPS_STATE.ENABLED
    }
}

const gpsIcon = computed(() => {
    switch (gpsState.value) {
        case GPS_STATE.DISABLED:
            return 'mdi-crosshairs-off'
        case GPS_STATE.ENABLED:
            return 'mdi-crosshairs' // Zamienione z TRACKING
        case GPS_STATE.TRACKING:
            return 'mdi-crosshairs-gps' // Zamienione z ENABLED
        default:
            return 'mdi-crosshairs-off'
    }
})

const gpsAriaLabel = computed(() => {
    switch (gpsState.value) {
        case GPS_STATE.DISABLED:
            return 'Włącz GPS'
        case GPS_STATE.ENABLED:
            return 'Włącz śledzenie GPS'
        case GPS_STATE.TRACKING:
            return 'Wyłącz GPS'
        default:
            return 'GPS'
    }
})

const gpsButtonClass = computed(() => {
    switch (gpsState.value) {
        case GPS_STATE.ENABLED:
            return 'gps-enabled'
        case GPS_STATE.TRACKING:
            return 'gps-tracking'
        default:
            return ''
    }
})

const handleGpsToggle = async () => {
    // Pobierz istniejącą instancję mapy
    const { createMap } = await import('@/services/olMap')
    const map = createMap() // Funkcja zwraca istniejącą mapę lub tworzy nową jeśli nie istnieje

    switch (gpsState.value) {
        case GPS_STATE.DISABLED:
            // Przejdź do stanu ENABLED - pokaż pozycję GPS
            const success = await startGpsTracking(map)
            if (success) {
                gpsState.value = GPS_STATE.ENABLED
            }
            break
        case GPS_STATE.ENABLED:
            // Przejdź do stanu TRACKING - śledź pozycję GPS
            gpsState.value = GPS_STATE.TRACKING
            // Jeśli mamy aktualną pozycję, wycentruj mapę
            const currentPos = getCurrentPosition()
            if (currentPos) {
                centerMapOn(currentPos.lat, currentPos.lon, 16) // Duże ale rozsądne przybliżenie
            }
            break
        case GPS_STATE.TRACKING:
            // Przejdź do stanu DISABLED - wyłącz GPS
            gpsState.value = GPS_STATE.DISABLED
            stopGpsTracking(map)
            break
    }
}

onMounted(() => {
    // Rejestracja callback'a dla pozycji GPS w trybie TRACKING
    setGpsPositionCallback((lat, lon, accuracy) => {
        if (gpsState.value === GPS_STATE.TRACKING) {
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
    if (gpsState.value !== GPS_STATE.DISABLED) {
        import('@/services/olMap').then(({ createMap }) => {
            const map = createMap()
            stopGpsTracking(map)
        })
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
