<template>
    <div
        v-if="currentStep"
        class="game-step"
    >
        <div
            v-if="bgImage"
            class="bg-image-container"
        >
            <v-img
                :src="`/stories/${storyId}/${bgImage.src}`"
                :alt="bgImage.alt || 'Obraz tła'"
                class="bg-image"
                :style="bgImage.blur ? 'filter: blur(3px);' : ''"
                cover
            />
        </div>
        <div
            id="contentSheet"
            class="step-content"
            @scroll="resetScrollOffset"
        >
            <!-- Spacer jeśli istnieje -->
            <div
                v-if="spacer"
                class="spacer"
                :style="{ height: 'calc(100% - 44px)' }"
            ></div>

            <!-- Zawartość owinięta w v-sheet -->
            <v-sheet
                v-if="contentItems.length > 0"
                class="content-sheet"
                elevation="4"
                rounded="lg"
            >
                <div
                    v-for="(item, index) in contentItems"
                    :key="index"
                    class="mb-4"
                >
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
                        v-else-if="item.type === 'header' || item.type === 'h4'"
                        class="text-h6 pa-0"
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

                <v-btn
                    :icon="
                        scrollOffset === 0
                            ? 'mdi-arrow-up-bold-outline'
                            : 'mdi-arrow-down-bold-outline'
                    "
                    variant="elevated"
                    size="small"
                    elevation="4"
                    rounded="sm"
                    color="primary"
                    class="scroll-top-btn"
                    @click="scrollToTop"
                />
            </v-sheet>
        </div>
    </div>
    <div
        v-else
        class="text-center pa-4"
    >
        <span>{{ $t('stepView.noStepAvailable') }}</span>
    </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useGoTo } from 'vuetify'

const props = defineProps({
    steps: {
        type: Array,
        required: true,
    },
    activeIndex: {
        type: Number,
        default: 0,
    },
    storyId: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['update-title'])
const goTo = useGoTo()

const scrollOffset = ref(0)
const currentStep = computed(() => {
    if (props.steps && props.steps.length > props.activeIndex) {
        return props.steps[props.activeIndex]
    }
    return null
})
const bgImage = computed(() => {
    return currentStep.value?.bgImage || null
})
const spacer = computed(() => {
    return currentStep.value?.spacer || null
})
const contentItems = computed(() => {
    return currentStep.value?.content || []
})

watch(
    () => props.activeIndex,
    () => {
        if (currentStep.value) {
            const titleKey = currentStep.value.title
            emit('update-title', titleKey)
        }
    },
    { immediate: true },
)

const scrollToTop = () => {
    let number = scrollOffset.value === 0 ? 100 : 0
    goTo(number, {
        duration: 300,
        easing: 'easeInOutCubic',
        container: '#contentSheet',
    })
    scrollOffset.value = number
}

const resetScrollOffset = (event) => {
    if (event && event.target && event.target.scrollTop === 0) {
        scrollOffset.value = 0
    } else {
        scrollOffset.value = 100
    }
}
</script>

<style scoped>
.game-step {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.bg-image-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
}

.bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.step-content {
    position: relative;
    z-index: 1;
    padding: 20px;
    height: 100%;
    max-height: 85vh;
    overflow-y: auto;
}

.step-title {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-sheet {
    position: relative;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(2px);
}

.scroll-top-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 5000;
}

.scroll-top-btn:hover {
    transform: scale(1.1);
}
</style>
