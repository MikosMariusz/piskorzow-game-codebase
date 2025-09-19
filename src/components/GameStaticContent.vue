<template>
    <div
        v-for="(item, index) in contentItems"
        :key="index"
        class="mb-4"
    >
        <v-card-title
            v-if="item.type === 'header'"
            class="text-h6 font-weight-medium pa-0"
        >
            {{ $t(item.text) }}
        </v-card-title>
        <v-img
            v-if="item.type === 'image'"
            :src="`/stories/${storyId}/${item.src}`"
            :alt="item.alt || 'Obraz'"
            class="rounded-sm elevation-4"
            :style="item.blur ? 'filter: blur(3px);' : ''"
            contain
        />
        <v-card-text
            v-else-if="item.type === 'text' || item.type === 'p'"
            class="text-body-1 pa-0"
        >
            {{ $t(item.text) }}
        </v-card-text>
        <v-card-title
            v-else-if="item.type === 'subheader'"
            class="text-subtitle font-weight-light pa-0"
        >
            {{ $t(item.text) }}
        </v-card-title>
        <v-carousel
            v-else-if="item.type === 'images' && item.list && item.list.length > 0"
            class="rounded-sm elevation-4"
            height="400"
            hide-delimiter-background
            crossfade
            show-arrows="hover"
        >
            <v-carousel-item
                v-for="(image, imageIndex) in item.list"
                :key="imageIndex"
                :src="`/stories/${storyId}/${image.src}`"
                :alt="image.alt || 'Obraz'"
                cover
            ></v-carousel-item>
        </v-carousel>
    </div>
</template>

<script setup>
const props = defineProps({
    contentItems: {
        type: Array,
        required: true,
    },
    header: {
        type: String,
        default: null,
    },
    storyId: {
        type: String,
        required: true,
    },
    scrollOffset: {
        type: Number,
        default: 0,
    },
    scrollToTop: {
        type: Function,
        required: true,
    },
})
</script>
