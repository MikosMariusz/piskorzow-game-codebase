<template>
    <div class="game-stories-card-wrapper pa-4">
        <div
            v-if="loading"
            class="d-flex flex-column align-center justify-center"
            style="height: 300px"
        >
            <v-progress-circular
                indeterminate
                color="primary"
                size="48"
            />
            <span class="mt-4 text-subtitle-1">{{ $t('loadingScenarios') }}</span>
        </div>
        <div v-else>
            <div class="pa-2 game-stories-list">
                <div
                    v-if="stories.length === 0"
                    class="text-body-1"
                >
                    {{ $t('noScenariosAvailable') }}
                </div>
                <template v-else>
                    <RouterTile
                        v-for="story in stories"
                        :key="story.id"
                        :config="{
                            ...story,
                            image: story.imagePath,
                            alt: story.title,
                            fallbackText: story.title,
                        }"
                        :title="$t(story.title)"
                        :disabled="story.disabled"
                        @click="handleStoryClick"
                        class="game-story-router-tile"
                    />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import RouterTile from '@/components/RouterTile.vue'
import { useRouter, useRoute } from 'vue-router'

const emit = defineEmits(['story-click'])
const router = useRouter()
const route = useRoute()

const handleStoryClick = (story) => {
    const prefix = route.path.startsWith('/presentation') ? '/presentation' : '/game'
    router.push(`${prefix}/${story.id}`)
    emit('story-click', story)
}

const loading = ref(true)
const stories = ref([])

onMounted(async () => {
    try {
        const response = await fetch('/stories/list.json')
        if (!response.ok) throw new Error('Błąd ładowania listy gier')
        const data = await response.json()
        stories.value = data.collection || []
    } catch (e) {
        stories.value = []
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.game-stories-card-wrapper {
    width: 100%;
    height: auto;
    max-width: 1200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.game-stories-list {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    justify-content: center;
}

.game-story-router-tile {
    flex: 0 0 auto;
    width: clamp(280px, 30vw, 300px);
    max-width: 400px;
    min-width: 280px;
}

.game-story-router-tile :deep(.tile-wrapper) {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
}

@media (max-width: 599px) {
    .game-stories-card-wrapper {
        padding: 0 8px;
    }

    .game-stories-list {
        gap: 20px;
        padding: 16px 0;
    }

    .game-story-router-tile {
        width: clamp(240px, 40vw, 100%);
        max-width: 100%;
        min-width: 240px;
    }

    .game-story-router-tile :deep(.tile-wrapper) {
        max-width: 100% !important;
        min-width: 0 !important;
    }
}

@media (max-width: 480px) {
    .game-stories-list {
        gap: 16px;
    }

    .game-story-router-tile {
        width: clamp(200px, 50vw, 100%);
        min-width: 200px;
    }

    .game-story-router-tile :deep(.tile-wrapper) {
        max-width: 100% !important;
        min-width: 0 !important;
    }
}

@media (max-width: 320px) {
    .game-stories-list {
        gap: 12px;
    }

    .game-story-router-tile {
        width: clamp(150px, 80vw, 100%);
        min-width: 150px;
    }

    .game-story-router-tile :deep(.tile-wrapper) {
        max-width: 100% !important;
        min-width: 0 !important;
    }
}

@media (min-width: 600px) and (max-width: 799px) {
    .game-stories-list {
        gap: 22px;
    }
}

@media (min-width: 800px) and (max-width: 1199px) {
    .game-stories-list {
        gap: 24px;
    }
}

@media (min-width: 1200px) {
    .game-stories-card-wrapper {
        max-width: 1400px;
    }

    .game-stories-list {
        gap: 28px;
        padding: 24px 0;
    }
}
</style>
