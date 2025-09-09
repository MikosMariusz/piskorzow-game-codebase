<template>
    <div class="home-layer">
        <v-container
            class="pa-0"
            fluid
        >
            <v-row
                class="justify-center ga-8 tiles-wrapper"
                no-gutters
            >
                <v-col
                    v-for="tile in tiles"
                    :key="tile.id"
                    cols="12"
                    sm="6"
                    md="4"
                    class="d-flex justify-center"
                >
                    <v-card
                        class="glass-card tile-card position-relative cursor-pointer"
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
                                style="top: 0; left: 0"
                            />
                            <div
                                v-else
                                class="h-100 w-100 d-flex align-center justify-center pa-4 text-center text-white font-weight-medium"
                                style="font-size: 1.05rem; letter-spacing: 0.5px"
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
                                    class="tile-label-sheet pa-3"
                                    elevation="4"
                                    rounded="lg"
                                >
                                    <p class="text-center text-h5 font-weight-light ma-2">
                                        {{ $t(tile.title) }}
                                    </p>
                                </v-sheet>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

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
    router.push(path)
}
</script>

<style scoped>
.home-layer {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none; /* przepuszcza klik poza kafelkami */
    z-index: 1200; /* ponad warstwą mapy */
}

.tile-card {
    pointer-events: auto;
}

.tile-card {
    width: min(90vw, 600px);
    aspect-ratio: 1;
    overflow: hidden;
    transition:
        transform 0.25s,
        box-shadow 0.25s,
        background 0.25s;
    margin: 1rem;
}

.tile-label-sheet {
    background: rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.15),
        0 2px 8px rgba(0, 0, 0, 0.1) !important;
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

/* Responsywność dla różnych rozmiarów ekranów */
@media (max-width: 480px) {
    .tile-card {
        width: min(85vw, 320px);
        margin: 0.5rem;
    }
}

@media (min-width: 481px) and (max-width: 768px) {
    .tile-card {
        width: min(70vw, 400px);
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .tile-card {
        width: min(45vw, 500px);
    }
}

@media (min-width: 1025px) {
    .tile-card {
        width: min(40vw, 600px);
    }
}

@media (max-width: 640px) {
    .tiles-wrapper {
        gap: 1rem !important;
    }
}
</style>
