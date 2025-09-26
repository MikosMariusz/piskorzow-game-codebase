<template>
    <div class="app-background">
        <div
            class="background-image"
            :style="{
                backgroundImage: `url(${backgroundImageUrl})`,
                filter: `blur(${blur ? 3 : 0}px) brightness(${brightness})`,
            }"
        ></div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    imageSrc: {
        type: String,
        default: '/images/app-background.png',
    },
    blur: {
        type: Boolean,
        default: false,
    },
    brightness: {
        type: Number,
        default: 1,
    },
})

const backgroundImageUrl = computed(() => {
    if (props.imageSrc.startsWith('/')) {
        return props.imageSrc
    }
    return new URL(props.imageSrc, import.meta.url).href
})
</script>

<style scoped>
.app-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
}

.background-image {
    position: absolute;
    top: -10px;
    left: -10px;
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
</style>
