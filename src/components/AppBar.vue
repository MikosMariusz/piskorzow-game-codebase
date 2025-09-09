<template>
    <v-app-bar :image="bg">
        <template v-slot:image>
            <div class="gradient-container">
                <v-img
                    :src="bg"
                    :gradient="darkGradient"
                    class="gradient-layer"
                    :style="{ opacity, transitionDuration: `${getOSMDuration()}ms` }"
                ></v-img>
                <v-img
                    :src="bg"
                    :gradient="osmGradient"
                    class="gradient-layer"
                    :style="{ opacity: 1 - opacity, transitionDuration: `${getOSMDuration()}ms` }"
                ></v-img>
            </div>
        </template>
        <v-toolbar-title :class="{ 'text-shadow text-white': appStore.isDarkEnabled }">{{
            $t('gameTitle')
        }}</v-toolbar-title>
        <v-spacer />
        <lang-switcher class="mr-4" />
    </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { getOSMDuration } from '@/services/olMap'

const bg = new URL('../assets/images/bar-background.png', import.meta.url).href
const appStore = useAppStore()

const darkGradient = 'to top right, rgba(34,34,34,0.8), rgba(60,60,60,0.7)'
const osmGradient =
    '90deg, rgba(182,227,182,0.7) 0%, rgba(120,200,120,0.7) 50%, rgba(163,193,218,0.5) 100%'

const opacity = computed(() => (appStore.isDarkEnabled ? 1 : 0))
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
