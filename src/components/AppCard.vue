<template>
    <v-card
        :class="['app-card', { 'app-card--bordered': hasBorder }]"
        :style="{ opacity: opacity }"
        :rounded="rounded"
    >
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
.app-card {
    background-color: rgb(var(--v-theme-surface));
    background-image: linear-gradient(
        135deg,
        rgba(var(--v-theme-primary), 0.1) 0%,
        rgba(var(--v-theme-accent), 0.05) 100%
    );
}

.app-card--bordered {
    border: 3px solid rgb(var(--v-theme-primary));
}

.app-card :deep(.v-card-title) {
    font-weight: 600;
}

.app-card :deep(.v-card-text) {
    line-height: 1.6;
}

/* Responsywność */
@media (max-width: 960px) {
    .app-card--bordered {
        border-width: 2px;
    }
}

@media (max-width: 600px) {
    .app-card--bordered {
        border-width: 1px;
    }
}
</style>
