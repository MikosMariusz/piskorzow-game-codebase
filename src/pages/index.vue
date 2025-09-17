<template>
    <div class="home-layer">
        <div class="tiles-container">
            <div class="tiles-grid">
                <RouterTile
                    v-for="tile in tiles"
                    :key="tile.id"
                    :config="tile"
                    :title="getTileTitle(tile)"
                    :disabled="tile.id === 'game' && !appStore.hasGpsAccess"
                    @click="handleTileClick"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import RouterTile from '@/components/RouterTile.vue'

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

function handleTileClick(tileConfig) {
    if (tileConfig.id === 'game' && !appStore.hasGpsAccess) {
        return
    }
    router.push(tileConfig.route)
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
    padding-top: calc(
        64px + env(safe-area-inset-top)
    ); /* Dodaj padding dla AppBar (64px to standardowa wysokość v-app-bar) */
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

/* Responsywność dla różnych rozmiarów ekranów */
@media (max-width: 599px) {
    .home-layer {
        padding-top: calc(
            64px + env(safe-area-inset-top) + 10px
        ); /* Dodatkowe 10px marginesu na mobile */
    }

    .tiles-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 10px;
    }

    .tiles-container {
        padding: 15px;
    }
}

@media (min-width: 600px) and (max-width: 959px) {
    .tiles-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        max-width: 700px;
    }

    .tiles-container {
        padding: 20px;
    }
}

@media (min-width: 960px) and (max-width: 1279px) {
    .tiles-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        max-width: 800px;
    }

    .tiles-container {
        padding: 25px;
    }
}

@media (min-width: 1280px) {
    .tiles-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        max-width: 900px;
    }

    .tiles-container {
        padding: 30px;
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

    .tiles-container {
        padding: 10px;
    }
}
</style>
