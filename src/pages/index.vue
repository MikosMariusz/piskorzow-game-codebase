<template>
    <div class="home-layer">
        <div class="tiles-container">
            <div class="tiles-grid">
                <div
                    v-for="tile in tiles"
                    :key="tile.id"
                    class="tile-wrapper"
                >
                    <v-card
                        class="glass-card tile-card position-relative"
                        :class="{
                            'cursor-not-allowed': tile.id === 'game' && !appStore.hasGpsAccess,
                            'cursor-pointer': !(tile.id === 'game' && !appStore.hasGpsAccess),
                        }"
                        role="button"
                        elevation="8"
                        tabindex="0"
                        rounded="lg"
                        @click="go(tile.route)"
                        @keyup.enter.space="go(tile.route)"
                    >
                        <div class="tile-content position-relative w-100 h-100">
                            <v-img
                                v-if="tile.image"
                                :src="tile.image"
                                :alt="tile.alt"
                                cover
                                height="100%"
                                width="100%"
                                class="position-absolute"
                                :class="{
                                    'grayscale-filter':
                                        tile.id === 'game' && !appStore.hasGpsAccess,
                                }"
                                style="top: 0; left: 0"
                            />
                            <div
                                v-else
                                class="h-100 w-100 d-flex align-center justify-center pa-2 text-center text-white font-weight-medium fallback-text"
                            >
                                {{ tile.fallbackText }}
                            </div>
                            <div
                                class="position-absolute d-flex align-center justify-center"
                                style="
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    z-index: 2;
                                "
                            >
                                <v-sheet
                                    class="tile-label-sheet pa-2"
                                    elevation="4"
                                    rounded="lg"
                                >
                                    <p
                                        class="text-center tile-title font-weight-light ma-1"
                                        :class="{
                                            'text-primary':
                                                tile.id === 'game' && !appStore.hasGpsAccess,
                                        }"
                                    >
                                        {{ getTileTitle(tile) }}
                                    </p>
                                </v-sheet>
                            </div>
                        </div>
                    </v-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const tiles = [
    {
        id: 'game',
        title: 'terrainGame',
        route: '/game',
        image: new URL('../assets/images/gra_terenowa_logo.png', import.meta.url).href,
        alt: 'terrainGame',
        fallbackText: 'terrainGame',
    },
    {
        id: 'presentation',
        title: 'villagePresentation',
        route: '/presentation',
        image: new URL('../assets/images/interaktywna_prezentacja.png', import.meta.url).href,
        alt: 'villagePresentation',
        fallbackText: 'villagePresentation',
    },
]

function go(path) {
    const tile = tiles.find((t) => t.route === path)
    if (tile && tile.id === 'game' && !appStore.hasGpsAccess) {
        return
    }
    router.push(path)
}

function getTileTitle(tile) {
    if (tile.id === 'game' && !appStore.hasGpsAccess) {
        return t('terrainGameUnavailable')
    }
    return t(tile.title)
}
</script>

<style scoped>
.home-layer {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1200;
    overflow: hidden;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
        env(safe-area-inset-left);
}

.tiles-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.tiles-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    max-width: 100%;
    width: 100%;
    max-width: 1200px; /* maksymalna szerokość całego kontenera */
    justify-items: center;
}

.tile-wrapper {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
}

.tile-card {
    pointer-events: auto;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition:
        transform 0.25s,
        box-shadow 0.25s,
        background 0.25s;
}

.tile-label-sheet {
    background: rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.15),
        0 2px 8px rgba(0, 0, 0, 0.1) !important;
    max-width: 90%;
    word-wrap: break-word;
    hyphens: auto;
}

.tile-title {
    font-size: clamp(0.9rem, 3.5vw, 1.5rem);
    line-height: 1.2;
    word-break: break-word;
    hyphens: auto;
    text-align: center;
}

.fallback-text {
    font-size: clamp(0.8rem, 3vw, 1.2rem);
    letter-spacing: 0.3px;
    line-height: 1.3;
    word-break: break-word;
}

.tile-card:focus-visible {
    outline: 3px solid #ffffff;
    outline-offset: 4px;
    transform: translateY(-4px);
}

.tile-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
        0 20px 50px -10px rgba(0, 0, 0, 0.6),
        0 8px 20px -4px rgba(0, 0, 0, 0.4);
}

.glass-card {
    background: rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.tile-card:hover.glass-card {
    background: rgba(255, 255, 255, 0.12) !important;
}

.grayscale-filter {
    filter: grayscale(100%) brightness(0.5) !important;
}

.cursor-not-allowed {
    cursor: not-allowed !important;
}

/* Responsywność dla różnych rozmiarów ekranów */
@media (max-width: 599px) {
    .tiles-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 10px;
    }

    .tile-wrapper {
        max-width: min(85vw, 320px);
    }

    .tiles-container {
        padding: 15px;
    }

    .tile-title {
        font-size: clamp(0.8rem, 4vw, 1.1rem) !important;
        line-height: 1.1;
    }

    .tile-label-sheet {
        padding: 0.5rem !important;
        max-width: 85%;
    }

    .fallback-text {
        font-size: clamp(0.7rem, 3.5vw, 1rem) !important;
    }
}

@media (min-width: 600px) and (max-width: 959px) {
    .tiles-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        max-width: 700px;
    }

    .tile-wrapper {
        max-width: 300px;
    }

    .tiles-container {
        padding: 20px;
    }

    .tile-title {
        font-size: clamp(0.8rem, 3vw, 1.2rem) !important;
        line-height: 1.1;
    }

    .tile-label-sheet {
        padding: 0.6rem !important;
        max-width: 88%;
    }

    .fallback-text {
        font-size: clamp(0.75rem, 2.5vw, 1rem) !important;
    }
}

@media (min-width: 960px) and (max-width: 1279px) {
    .tiles-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        max-width: 800px;
    }

    .tile-wrapper {
        max-width: 350px;
    }

    .tiles-container {
        padding: 25px;
    }

    .tile-title {
        font-size: clamp(1rem, 2.5vw, 1.3rem) !important;
        line-height: 1.2;
    }

    .tile-label-sheet {
        padding: 0.8rem !important;
        max-width: 90%;
    }
}

@media (min-width: 1280px) {
    .tiles-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        max-width: 900px;
    }

    .tile-wrapper {
        max-width: 400px;
    }

    .tiles-container {
        padding: 30px;
    }

    .tile-title {
        font-size: clamp(1.1rem, 2vw, 1.4rem) !important;
        line-height: 1.2;
    }

    .tile-label-sheet {
        padding: 1rem !important;
        max-width: 90%;
    }
}

/* Dla bardzo dużych ekranów - możemy pokazać 3 kafelki, jeśli jest więcej */
@media (min-width: 1600px) {
    .tiles-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        max-width: 1200px;
    }
}

/* Orientacja landscape na mobilnych */
@media (max-width: 959px) and (orientation: landscape) and (max-height: 600px) {
    .tiles-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }

    .tile-wrapper {
        max-width: min(40vh, 250px);
    }

    .tiles-container {
        padding: 10px;
    }

    .tile-title {
        font-size: clamp(0.7rem, 3vh, 1rem) !important;
        line-height: 1.1;
    }

    .tile-label-sheet {
        padding: 0.4rem !important;
        max-width: 85%;
    }

    .fallback-text {
        font-size: clamp(0.6rem, 2.5vh, 0.9rem) !important;
    }
}
</style>
