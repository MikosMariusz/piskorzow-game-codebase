<template>
    <v-btn
        :icon="icon && !label ? true : false"
        variant="elevated"
        size="small"
        rounded="sm"
        @click="action"
        :title="title.length ? $t(title) : undefined"
        elevation="2"
        :color="color"
        :height="height"
    >
        <v-icon
            v-if="icon && !right"
            :icon="icon"
            :class="label ? 'mr-2' : ''"
        ></v-icon>
        <span v-if="label">{{ $t(label) }}</span>
        <v-icon
            v-if="icon && right"
            :icon="icon"
            :class="label ? 'ml-2' : ''"
        ></v-icon>
    </v-btn>
</template>

<script setup>
const props = defineProps({
    color: {
        type: String,
        default: 'primary',
    },
    icon: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    height: {
        type: [Number, String],
        default: '40',
    },
    right: {
        type: Boolean,
        default: false,
    },
    action: {
        type: Function,
        default: () => {},
    },
})
</script>
