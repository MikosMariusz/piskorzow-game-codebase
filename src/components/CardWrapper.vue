<template>
    <transition
        :name="transitionName"
        appear
    >
        <app-card
            v-if="visible"
            :class="cardClasses"
            :style="cardStyles"
            :has-border="true"
            rounded="0"
            elevation="6"
        >
            <v-card-title
                class="d-flex align-center justify-space-between pa-4 card-header-with-bg"
            >
                <div class="header-background"></div>
                <span class="text-h6 header-title font-weight-light">{{ title }}</span>
                <div class="d-flex align-center header-controls">
                    <v-btn
                        v-if="smAndDown && !isMobileMaximized"
                        icon="mdi-fullscreen"
                        variant="elevated"
                        size="small"
                        @click="toggleMaximize"
                        :title="$t('gameCard.maximize')"
                        class="mr-2 square-btn"
                        elevation="2"
                    />
                    <v-btn
                        v-if="smAndDown && isMobileMaximized"
                        icon="mdi-fullscreen-exit"
                        variant="elevated"
                        size="small"
                        @click="toggleMaximize"
                        :title="$t('gameCard.minimize')"
                        class="mr-2 square-btn"
                        elevation="2"
                    />
                    <v-btn
                        icon="mdi-close"
                        variant="elevated"
                        size="small"
                        @click="closeCard"
                        :title="$t('gameCard.close')"
                        class="square-btn"
                        elevation="2"
                    />
                </div>
            </v-card-title>

            <v-divider />

            <v-card-text class="card-content-scroll pa-6">
                <slot />
            </v-card-text>
        </app-card>
    </transition>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import { useAppStore } from '@/stores/app'
import AppCard from '@/components/AppCard.vue'

const { mobile, tablet, smAndDown, mdAndUp } = useDisplay()
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
})

const emit = defineEmits(['update:visible'])

const isMobileMaximized = ref(false)

const transitionName = computed(() => {
    // If window is being closed by replacement, use no-animation transition
    if (appStore.getIsWindowClosedByReplacement && !props.visible) {
        return 'no-animation'
    }
    return 'fade'
})

const formattedDesktopWidth = computed(() => {
    // If fullPage, use wider width
    if (props.fullPage) {
        return 'calc(100vw - 20px)' // Full width minus margins
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

// Auto-maximize on mobile for fullPage windows
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

    if (props.fullscreen) {
        classes.push('card-wrapper--fullscreen-mode')
    } else if (isMobileMaximized.value) {
        classes.push('card-wrapper--fullscreen')
    }

    return classes.join(' ')
})

const cardStyles = computed(() => {
    const styles = {
        position: 'fixed',
        zIndex: 2000,
    }

    if (props.fullscreen) {
        return {
            ...styles,
            left: '0',
            right: '0',
            top: '0',
            bottom: '0',
            width: '100vw',
            height: '100vh',
            maxHeight: '100vh',
            zIndex: 9999,
        }
    }

    // Mobile maximized takes priority
    if (isMobileMaximized.value) {
        return {
            ...styles,
            left: '0',
            right: '0',
            bottom: '0',
            width: '100vw',
            height: 'calc(100vh - 64px)',
            maxHeight: 'calc(100vh - 64px)',
            zIndex: 2000,
        }
    }

    return styles
})

const toggleMaximize = () => {
    isMobileMaximized.value = !isMobileMaximized.value
}

const closeCard = () => {
    isMobileMaximized.value = false
    emit('update:visible', false)
}
</script>

<style scoped>
.card-wrapper {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0 !important;
}

.card-header-with-bg {
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
    z-index: 1;
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

.card-wrapper {
    top: 74px;
    right: 10px;
    bottom: 10px;
    width: v-bind(formattedDesktopWidth);
    height: calc(100vh - 84px);
    max-height: calc(100vh - 84px);
}

/* Small screens and down (xs, sm) */
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

/* Medium screens and up (md+) */
@media (min-width: 960px) {
    .card-wrapper {
        top: 74px !important;
        right: 10px !important;
        bottom: 10px !important;
        left: unset !important;
        width: v-bind(formattedDesktopWidth) !important;
        height: calc(100vh - 84px) !important;
        max-height: calc(100vh - 84px) !important;
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

.card-wrapper--fullscreen-mode {
    border-radius: 0 !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
    height: 100vh !important;
    max-height: 100vh !important;
    width: 100vw !important;
    max-width: 100vw !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
}

.card-content-scroll {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}

@media (max-width: 959px) {
    .card-content-scroll {
        max-height: calc(50vh - 120px);
    }

    .card-wrapper--fullscreen .card-content-scroll {
        max-height: calc(100vh - 128px) !important;
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

@media (max-width: 959px) {
    .card-wrapper {
        animation: slideUpFromBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
}

@keyframes slideUpFromBottom {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
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

/* No animation transition for instant closing */
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

    /* No animation for mobile too */
    .no-animation-enter-from,
    .no-animation-leave-to {
        opacity: 0;
        transform: none;
        filter: none;
    }
}
</style>
