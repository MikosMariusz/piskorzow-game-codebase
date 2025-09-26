<template>
    <v-card
        class="map-attributions"
        :class="{ expanded: isExpanded }"
        elevation="4"
        rounded="sm"
    >
        <v-card-text class="attribution-bar pa-1">
            <div class="osm-attribution ml-2">
                ©
                <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    class="text-decoration-none"
                    :class="
                        theme.global.current.value.dark
                            ? 'text-blue-lighten-2'
                            : 'text-blue-darken-2'
                    "
                >
                    OpenStreetMap contributors
                </a>
            </div>

            <v-btn
                variant="text"
                size="small"
                density="compact"
                :icon="isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-up'"
                @click="toggleExpanded"
                :aria-label="isExpanded ? 'Ukryj współrzędne' : 'Pokaż współrzędne'"
                class="expand-button"
            />
        </v-card-text>

        <v-expand-transition>
            <div
                v-if="isExpanded"
                class="coordinates-wrapper"
            >
                <v-card-text class="coordinates-bar pt-0 pb-1 px-3">
                    <v-divider class="mb-2" />
                    <div class="coordinates-display">
                        <div
                            v-if="coordinates.lat !== null && coordinates.lon !== null"
                            class="coordinates-container"
                        >
                            <v-chip
                                variant="outlined"
                                size="small"
                                class="font-monospace coordinates-chip"
                                :color="
                                    theme.global.current.value.dark
                                        ? 'blue-grey-lighten-2'
                                        : 'blue-grey-darken-1'
                                "
                            >
                                {{ coordinates.lon.toFixed(7) }}°, {{ coordinates.lat.toFixed(7) }}°
                            </v-chip>
                            <v-btn
                                variant="text"
                                size="x-small"
                                density="compact"
                                icon="mdi-content-copy"
                                @click="copyCoordinates"
                                :aria-label="'Kopiuj współrzędne'"
                                class="copy-button"
                            />
                        </div>
                        <v-chip
                            v-else
                            variant="outlined"
                            size="small"
                            color="grey"
                            class="no-coordinates"
                        >
                            <v-icon
                                start
                                size="small"
                            >
                                mdi-map-marker-outline
                            </v-icon>
                            Kliknij na mapę
                        </v-chip>
                    </div>
                </v-card-text>
            </div>
        </v-expand-transition>
    </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const isExpanded = ref(false)
const coordinates = ref({ lat: null, lon: null })

const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
}

const updateCoordinates = (lat, lon) => {
    coordinates.value.lat = lat
    coordinates.value.lon = lon
}

const clearCoordinates = () => {
    coordinates.value.lat = null
    coordinates.value.lon = null
}

const copyCoordinates = async () => {
    if (coordinates.value.lat !== null && coordinates.value.lon !== null) {
        const coordsText = `${coordinates.value.lon.toFixed(7)}, ${coordinates.value.lat.toFixed(7)}`
        try {
            await navigator.clipboard.writeText(coordsText)
        } catch (err) {
            const textArea = document.createElement('textarea')
            textArea.value = coordsText
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
        }
    }
}

defineExpose({
    updateCoordinates,
    clearCoordinates,
})
</script>

<style scoped>
.map-attributions {
    position: fixed;
    bottom: 12px;
    left: 12px;
    min-width: 200px;
    max-width: 400px;
    z-index: 1000;
}

.attribution-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.osm-attribution {
    flex: 1;
    font-size: 12px;
    white-space: nowrap;
}

.expand-button {
    min-width: auto !important;
    width: 32px !important;
    height: 32px !important;
}

.coordinates-wrapper {
    overflow: hidden;
}

.coordinates-bar {
    min-height: 56px;
}

.coordinates-display {
    display: flex;
    justify-content: center;
}

.coordinates-container {
    display: flex;
    align-items: center;
    gap: 4px;
}

.coordinates-chip {
    flex: 1;
}

.copy-button {
    min-width: auto !important;
    width: 24px !important;
    height: 24px !important;
}

.font-monospace {
    font-family: 'Courier New', 'Monaco', monospace !important;
}

@media (max-width: 480px) {
    .map-attributions {
        bottom: 8px;
        left: 8px;
        right: 8px;
        min-width: auto;
        max-width: none;
    }

    .osm-attribution {
        font-size: 11px;
    }
}
</style>
