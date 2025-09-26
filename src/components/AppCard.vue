<template>
    <v-card
        :style="{
            opacity: opacity,
            border: hasBorder ? '2px solid rgb(var(--v-theme-primary))' : 'none',
        }"
        :rounded="rounded"
    >
        <template v-if="$slots.header">
            <div class="card-header pa-0 elevation-4">
                <v-img
                    src="@/assets/images/bar-background.png"
                    gradient="to right, rgba(182,227,182,0.7), rgba(120,200,120,0.7) 50%, rgba(163,193,218,0.5) 100%"
                    cover
                    height="100%"
                    width="100%"
                    class="header-background-img"
                />
                <div style="z-index: 1">
                    <slot name="header" />
                </div>
            </div>
        </template>
        <slot />
    </v-card>
</template>

<script setup>
defineProps({
    opacity: {
        type: Number,
        default: 1,
    },
    hasBorder: {
        type: Boolean,
        default: true,
    },
    rounded: {
        type: String,
        default: 'sm',
    },
})
</script>

<style scoped>
.card-header {
    position: relative;
    overflow: hidden;
    height: 64px;
    z-index: 10;
}
.header-background-img {
    position: absolute;
    pointer-events: none;
    z-index: 0;
}
</style>
