<template>
    <v-app-bar :image="bg">
        <template v-slot:image>
            <div class="gradient-container">
                <v-img
                    :src="bg"
                    :gradient="darkGradient"
                    class="gradient-layer dark-layer"
                    :style="{ opacity }"
                ></v-img>
                <v-img
                    :src="bg"
                    :gradient="osmGradient"
                    class="gradient-layer osm-layer"
                    :style="{ opacity: 1 - opacity }"
                ></v-img>
            </div>
        </template>
        <v-toolbar-title style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7)">{{
            $t('gameTitle')
        }}</v-toolbar-title>
        <v-spacer />
        <lang-switcher class="mr-4" />
    </v-app-bar>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { addAnimationCallback, removeAnimationCallback, isDarkModeEnabled } from '../services/olMap.js'

const bg = new URL('../assets/images/bar-background.png', import.meta.url).href
const route = useRoute()
const isHome = computed(() => route.path === '/' || route.path === '/index')

const darkGradient = 'to top right, rgba(34,34,34,0.8), rgba(60,60,60,0.7)'
const osmGradient =
    '90deg, rgba(182,227,182,0.7) 0%, rgba(120,200,120,0.7) 50%, rgba(163,193,218,0.5) 100%'

const opacity = ref(1)

function handleOSMAnimation(event) {
    if (event.type === 'start') {
        // Rozpocznij animację - ustaw docelową opacity na podstawie isDark
        opacity.value = event.isDark ? 1 : 0
    }
}

// Ustaw początkową wartość opacity na podstawie aktualnej strony
onMounted(() => {
    // Sprawdź aktualny stan mapy, jeśli jest dostępny
    const currentMapState = isDarkModeEnabled()
    opacity.value = currentMapState ? 1 : 0
    
    // Fallback - jeśli mapa nie jest jeszcze zainicjalizowana, użyj routingu
    if (opacity.value === 0 && !currentMapState && isHome.value) {
        opacity.value = 1
    }
    
    // Dodatkowa synchronizacja po krótkim czasie (na wypadek późniejszej inicjalizacji mapy)
    setTimeout(() => {
        const finalMapState = isDarkModeEnabled()
        opacity.value = finalMapState ? 1 : 0
    }, 100)
    
    addAnimationCallback(handleOSMAnimation)
})

onBeforeUnmount(() => {
    removeAnimationCallback(handleOSMAnimation)
})
</script>

<style scoped>
.gradient-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.gradient-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.3s ease-in-out;
}
</style>
