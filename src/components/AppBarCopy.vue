<template>
    <v-app-bar
        :image="bg"
        style="z-index: 1300"
    >
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
        <v-btn
            icon="mdi-information-outline"
            variant="elevated"
            size="small"
            elevation="4"
            rounded="sm"
            class="mr-5"
            color="primary"
            :title="$t('projectInfo.showInfo')"
            @click="$emit('show-project-info')"
            @contextmenu.prevent="$emit('reset-project-info')"
        />
        <lang-switcher class="mr-4" />
    </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { getOSMDuration } from '@/services/olMap'

defineEmits(['show-project-info', 'reset-project-info'])

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

/* Hover effect for home button */
.v-btn:hover {
    transform: translateY(-1px);
    transition: transform 0.2s ease-in-out;
}
</style>
