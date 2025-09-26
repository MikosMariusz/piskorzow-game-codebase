<template>
    <div class="tile-wrapper">
        <v-card
            class="glass-card tile-card position-relative"
            :class="{
                'cursor-not-allowed': disabled,
                'cursor-pointer': !disabled,
            }"
            role="button"
            elevation="8"
            tabindex="0"
            rounded="lg"
            @click="handleClick"
            @keyup.enter.space="handleClick"
        >
            <div class="tile-content position-relative w-100 h-100">
                <v-img
                    v-if="config.image"
                    :src="config.image"
                    :alt="config.alt"
                    cover
                    height="100%"
                    width="100%"
                    class="position-absolute"
                    :class="{
                        'grayscale-filter': disabled,
                    }"
                    style="top: 0; left: 0"
                />
                <div
                    v-else
                    class="h-100 w-100 d-flex align-center justify-center pa-2 text-center text-white font-weight-medium fallback-text"
                >
                    {{ config.fallbackText }}
                </div>
                <div
                    class="position-absolute d-flex align-center justify-center w-90"
                    style="left: 10px; right: 10px; bottom: 10px; z-index: 2"
                >
                    <v-sheet
                        class="tile-label-sheet pa-2"
                        elevation="4"
                        rounded="lg"
                    >
                        <p
                            class="text-center tile-title font-weight-light ma-1"
                            :class="{
                                'text-primary': disabled,
                            }"
                        >
                            {{ title }}
                        </p>
                    </v-sheet>
                </div>
            </div>
        </v-card>
    </div>
</template>

<script setup>
const props = defineProps({
    config: {
        type: Object,
        required: true,
        validator: (value) => {
            return (
                value &&
                typeof value === 'object' &&
                value.id &&
                value.title &&
                (value.image || value.fallbackText)
            )
        },
    },
    title: {
        type: String,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['click'])

const handleClick = () => {
    if (!props.disabled) {
        emit('click', props.config)
    }
}
</script>

<style scoped>
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

@media (max-width: 599px) {
    .tile-wrapper {
        max-width: min(70vw, 320px);
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
    .tile-wrapper {
        max-width: 300px;
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
    .tile-wrapper {
        max-width: 350px;
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
    .tile-wrapper {
        max-width: 400px;
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

@media (max-width: 959px) and (orientation: landscape) and (max-height: 600px) {
    .tile-wrapper {
        max-width: min(40vh, 250px);
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
