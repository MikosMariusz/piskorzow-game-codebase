<template>
    <app-card
        v-if="visible"
        :class="cardClasses"
        :style="cardStyles"
        :has-border="true"
        rounded="0"
        elevation="6"
    >
        <v-card-title
            class="d-flex align-center justify-space-between pa-4 pt-3 card-header-with-bg"
            :class="{ 'card-header--minimized': isMinimized }"
            @click="isMinimized ? toggleMinimize() : null"
            style="user-select: none; height: 64px; min-height: 64px; max-height: 64px"
        >
            <div class="header-background"></div>
            <span class="text-h6 header-title font-weight-light">{{ title }}</span>
            <div
                class="d-flex align-center header-controls"
                v-if="buttonConfigs.length"
                @click.stop
            >
                <template
                    v-for="btn in buttonConfigs"
                    :key="btn.key"
                >
                    <v-btn
                        v-if="btn.visible"
                        :icon="btn.icon"
                        variant="elevated"
                        size="small"
                        @click="btn.action"
                        :title="t(btn.title)"
                        class="mr-2 square-btn"
                        elevation="2"
                    />
                </template>
            </div>
        </v-card-title>
        <transition
            :name="transitionName"
            appear
        >
            <v-card-text
                v-if="!isMinimized"
                class="pa-4"
                style="overflow-y: auto; height: calc(100% - 64px)"
            >
                <div style="height: 100%">
                    <slot />
                </div>
            </v-card-text>
        </transition>
    </app-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import AppCard from '@/components/AppCard.vue'

const { smAndDown, mdAndUp } = useDisplay()
const { t } = useI18n()
const appStore = useAppStore()

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    desktopWidth: {
        type: [String, Number],
        default: '500px',
        validator: (value) => {
            return (
                typeof value === 'number' ||
                (typeof value === 'string' && /^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/.test(value))
            )
        },
    },
    fullscreen: {
        type: Boolean,
        default: false,
    },
    fullPage: {
        type: Boolean,
        default: false,
    },
    centered: {
        type: Boolean,
        default: false,
    },
    closable: {
        type: Boolean,
        default: true,
    },
    minimize: {
        type: Boolean,
        default: true,
    },
})

const emit = defineEmits(['update:visible'])

const isMobileMaximized = ref(false)
const isMinimized = ref(false)
const TOGGLE_DELAY = 200
const RESTORE_DELAY = 400

const toggleMinimizeMobile = () => {
    if (!isMinimized.value) {
        appStore.gameCardVisible = false
        setTimeout(() => {
            isMinimized.value = true
        }, TOGGLE_DELAY)
    } else {
        isMinimized.value = false
        setTimeout(() => {
            appStore.gameCardVisible = true
        }, RESTORE_DELAY)
    }
}

const toggleMinimizeDesktop = () => {
    isMinimized.value = !isMinimized.value
}

const toggleMinimize = () => {
    if (smAndDown.value) {
        toggleMinimizeMobile()
    } else {
        toggleMinimizeDesktop()
    }

    if (isMinimized.value && isMobileMaximized.value) {
        isMobileMaximized.value = false
    }
}

watch(
    () => props.visible,
    (val) => {
        appStore.gameCardVisible = val
        if (!val) {
            isMinimized.value = false
        }
    },
    { immediate: true },
)

const transitionName = computed(() => {
    if (appStore.getIsWindowClosedByReplacement && !props.visible) {
        return 'no-animation'
    }
    return 'fade'
})

const formattedDesktopWidth = computed(() => {
    if (props.fullPage) {
        return 'calc(100vw - 20px)'
    }

    if (typeof props.desktopWidth === 'number') {
        return `${props.desktopWidth}px`
    }
    return props.desktopWidth
})

watch(smAndDown, (newIsSmall, oldIsSmall) => {
    if (oldIsSmall === true && newIsSmall === false && isMobileMaximized.value) {
        isMobileMaximized.value = false
    }
})
watch(
    [smAndDown, () => props.visible, () => props.fullPage],
    ([isSmall, visible, fullPage]) => {
        if (isSmall && visible && fullPage && !isMobileMaximized.value) {
            isMobileMaximized.value = true
        }
    },
    { immediate: true },
)

const cardClasses = computed(() => {
    const classes = ['card-wrapper']

    if (isMinimized.value) {
        classes.push('card-wrapper--minimized')
    } else if (isMobileMaximized.value) {
        classes.push('card-wrapper--fullscreen')
    }

    if (props.centered && mdAndUp.value) {
        classes.push('card-wrapper--centered')
    }

    return classes.join(' ')
})

const cardStyles = computed(() => {
    const styles = {
        position: 'fixed',
        zIndex: 2000,
    }

    if (isMinimized.value) {
        return {
            ...styles,
            overflow: 'hidden',
            zIndex: 2100,
        }
    }

    if (props.centered && mdAndUp.value) {
        return {
            ...styles,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            right: 'unset',
            bottom: 'unset',
            margin: 0,
            width: formattedDesktopWidth.value,
            height: 'auto',
            maxHeight: '90vh',
        }
    }

    return styles
})

const toggleMaximize = () => {
    isMobileMaximized.value = !isMobileMaximized.value
}

const closeCard = () => {
    if (!props.closable) return
    isMobileMaximized.value = false
    isMinimized.value = false
    appStore.gameCardVisible = false
    emit('update:visible', false)
}

const buttonConfigs = computed(() => [
    {
        key: 'minimize',
        icon: smAndDown.value ? 'mdi-chevron-down' : 'mdi-chevron-up',
        title: 'gameCard.minimize',
        action: toggleMinimize,
        visible: !isMinimized.value && props.minimize,
    },
    {
        key: 'restore',
        icon: smAndDown.value ? 'mdi-chevron-up' : 'mdi-chevron-down',
        title: 'gameCard.restore',
        action: toggleMinimize,
        visible: isMinimized.value && props.minimize,
    },
    {
        key: 'maximize',
        icon: 'mdi-fullscreen',
        title: 'gameCard.maximize',
        action: toggleMaximize,
        visible: smAndDown.value && !isMobileMaximized.value && !isMinimized.value,
    },
    {
        key: 'minimizeFullscreen',
        icon: 'mdi-fullscreen-exit',
        title: 'gameCard.minimize',
        action: toggleMaximize,
        visible: smAndDown.value && isMobileMaximized.value && !isMinimized.value,
    },
    {
        key: 'close',
        icon: 'mdi-close',
        title: 'gameCard.close',
        action: closeCard,
        visible: props.closable,
    },
])
</script>

<style scoped>
.card-wrapper {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 0 !important;
    transform-origin: top center;
    top: 74px;
    right: 10px;
    bottom: 10px;
    width: v-bind(formattedDesktopWidth);
}

.card-wrapper--centered {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
}

.card-header-with-bg {
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
    z-index: 1;
    height: 64px;
    min-height: 64px;
    max-height: 64px;
}

.header-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('@/assets/images/bar-background.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 0;
}

.header-background::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        90deg,
        rgba(182, 227, 182, 0.7) 0%,
        rgba(120, 200, 120, 0.7) 50%,
        rgba(163, 193, 218, 0.5) 100%
    );
    z-index: 1;
}

.header-title {
    position: relative;
    z-index: 2;
    color: #000000;
    font-weight: 500;
}

.header-controls {
    position: relative;
    z-index: 2;
}

.header-controls .v-btn {
    background-color: rgb(var(--v-theme-primary)) !important;
    color: white !important;
    border-radius: 0 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
    min-width: 32px !important;
    min-height: 32px !important;
}

.square-btn {
    border-radius: 0 !important;
}

@media (max-width: 959px) {
    .card-wrapper {
        top: unset !important;
        right: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 50vh !important;
        max-height: 50vh !important;
        border-radius: 0 !important;
    }
}

@media (min-width: 960px) {
    .card-wrapper {
        top: 74px !important;
        right: 10px !important;
        bottom: 10px !important;
        left: unset !important;
        width: v-bind(formattedDesktopWidth) !important;
    }

    /* Wyśrodkowane okna na desktopie */
    .card-wrapper--centered {
        top: 50% !important;
        left: 50% !important;
        right: unset !important;
        bottom: unset !important;
        transform: translate(-50%, -50%) !important;
        width: v-bind(formattedDesktopWidth) !important;
    }
}

.card-wrapper--fullscreen {
    border-radius: 0 !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
    bottom: 0 !important;
    height: calc(100vh - 64px) !important;
    max-height: calc(100vh - 64px) !important;
    transform-origin: bottom center;
}

.card-wrapper--minimized {
    height: 64px !important;
    min-height: 64px !important;
    max-height: 64px !important;
    overflow: hidden !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
    z-index: 2100 !important;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.card-header--minimized {
    min-height: 64px !important;
    max-height: 64px !important;
    height: 64px !important;
    cursor: pointer;
    user-select: none;
    box-shadow: none !important;
}

@media (max-width: 959px) {
    .card-wrapper--minimized {
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        top: unset !important;
        width: 100vw !important;
        border-radius: 0 !important;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.18) !important;
    }
}

@media (min-width: 960px) {
    .card-wrapper--minimized {
        top: 74px !important;
        right: 10px !important;
        bottom: calc(100vh - 74px - 64px) !important;
        left: unset !important;
        width: v-bind(formattedDesktopWidth) !important;
    }

    .card-wrapper--minimized.card-wrapper--centered {
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        right: unset !important;
        bottom: unset !important;
    }
}

.card-content-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.card-content-scroll {
    height: calc(100% - 64px);
    overflow-y: auto;
}

.card-wrapper--centered .card-content-container {
    height: 90vh;
}

.card-wrapper--centered .card-content-scroll {
    flex: 1;
    min-height: 200px;
}

@media (max-width: 959px) {
    .card-wrapper--fullscreen .card-content-scroll {
        flex: 1;
    }
}

.card-content-scroll::-webkit-scrollbar {
    width: 6px;
}

.card-content-scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.card-content-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
}

.card-content-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    filter: blur(4px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    filter: blur(4px);
}

.no-animation-enter-active,
.no-animation-leave-active {
    transition: none;
}

.no-animation-enter-from,
.no-animation-leave-to {
    opacity: 0;
}

@media (max-width: 959px) {
    .fade-enter-from {
        opacity: 0;
        transform: translateY(100%) scale(0.98);
        filter: blur(6px);
    }

    .fade-leave-to {
        opacity: 0;
        transform: translateY(100%) scale(0.98);
        filter: blur(6px);
    }

    .no-animation-enter-from,
    .no-animation-leave-to {
        opacity: 0;
        transform: none;
        filter: none;
    }
}
</style>
