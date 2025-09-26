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
        <GameButton
            v-if="!appStore.isHomePage"
            class="ml-2"
            icon="mdi-arrow-left"
            color="''"
            title="navigation.backToHome"
            :action="goBack"
        />
        <v-toolbar-title :class="{ 'text-shadow text-white': appStore.isHomePage }">{{
            $t('gameTitle')
        }}</v-toolbar-title>
        <v-spacer />
        <GameButton
            icon="mdi-information-outline"
            title="projectInfo.showInfo"
            :action="
                () => {
                    $emit('show-project-info')
                }
            "
            @contextmenu.prevent="$emit('reset-project-info')"
            class="mr-5"
        />
        <lang-switcher class="mr-4" />
    </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getOSMDuration } from '@/services/olMap'
import GameButton from '@/components/GameButton.vue'

defineEmits(['show-project-info', 'reset-project-info'])

const bg = new URL('../assets/images/bar-background.png', import.meta.url).href
const appStore = useAppStore()
const $router = useRouter()

const darkGradient = 'to top right, rgba(34,34,34,0.8), rgba(60,60,60,0.7)'
const osmGradient =
    '90deg, rgba(182,227,182,0.7) 0%, rgba(120,200,120,0.7) 50%, rgba(163,193,218,0.5) 100%'

const opacity = computed(() => (appStore.isHomePage ? 1 : 0))

const goBack = () => {
    const currentPath = $router.currentRoute.value.path
    if (currentPath.startsWith('/game/')) {
        $router.push('/game')
    } else if (currentPath === '/game') {
        $router.push('/')
    } else if (currentPath.startsWith('/presentation/')) {
        $router.push('/presentation')
    } else if (currentPath === '/presentation') {
        $router.push('/')
    } else {
        $router.push('/')
    }
}
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
