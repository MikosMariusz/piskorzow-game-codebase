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
                :style="{ filter: bgImage.blur ? 'blur(3px)' : 'none' }"
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
                class="content-sheet pa-2"
                elevation="4"
                rounded="lg"
            >
                <v-card-title
                    v-if="header"
                    class="text-h6 font-weight-medium pa-2 mb-4"
                >
                    {{ $t(header) }}
                </v-card-title>
                <v-expansion-panels
                    v-if="isGame && hasTask"
                    multiple
                    v-model="expansionPanels"
                >
                    <v-expansion-panel>
                        <v-expansion-panel-title>{{
                            $t('stepView.sectionTask')
                        }}</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <GameTask
                                v-if="hasTask"
                                :story-id="props.storyId"
                                :task="currentStep.task"
                                :accuracy="currentStep.accuracy"
                                :feature="currentStep.feature"
                                :hiddenPosition="currentStep.hiddenPosition"
                                @task-completed="onTaskCompleted"
                            />
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-title>{{
                            $t('stepView.sectionContent')
                        }}</v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <GameStaticContent
                                :content-items="contentItems"
                                :header="header"
                                :story-id="props.storyId"
                                :scroll-offset="scrollOffset"
                                :scroll-to-top="() => scrollToTop()"
                            />
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
                <div
                    v-else
                    class="mx-2 my-0 pa-0"
                >
                    <GameStaticContent
                        :content-items="contentItems"
                        :header="header"
                        :story-id="props.storyId"
                        :scroll-offset="scrollOffset"
                        :scroll-to-top="() => scrollToTop()"
                    />
                </div>
                <v-fade-transition
                    :duration="2000"
                    hide-on-leave
                >
                    <div
                        v-if="(isGame && !hasTask) || (isGame && isTaskCompleted)"
                        class="mt-3 mb-2 px-0"
                    >
                        <v-btn
                            v-if="!isLastStep"
                            color="primary"
                            @click="goToNextStep"
                            rounded="sm"
                            elevation="2"
                            :disabled="!nextStepActive"
                            block
                        >
                            {{ $t('stepView.nextStep') }}
                        </v-btn>
                        <v-btn
                            v-else
                            color="primary"
                            @click="goToPresentation"
                            rounded="sm"
                            elevation="2"
                            block
                        >
                            {{ $t('stepView.backToPresentation') }}
                        </v-btn>
                    </div>
                </v-fade-transition>

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
                    @click="() => scrollToTop()"
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
import { computed, watch, ref, onMounted } from 'vue'
import GameTask from './GameTask.vue'
import { useGoTo } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'

const expansionPanels = ref([0])
const route = useRoute()
const router = useRouter()
const isGame = computed(() => {
    return route.path.startsWith('/game')
})

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

const emit = defineEmits(['update-title', 'next-step'])
const goTo = useGoTo()

const scrollOffset = ref(0)
const isTaskCompleted = ref(false)
const nextStepActive = ref(false)

const currentStep = computed(() => {
    if (props.steps && props.steps.length > props.activeIndex) {
        return props.steps[props.activeIndex]
    }
    return null
})

const hasTask = computed(() => {
    return !!(currentStep.value && currentStep.value.task)
})
const bgImage = computed(() => {
    return currentStep.value?.bgImage || null
})
const spacer = computed(() => {
    return currentStep.value?.spacer || null
})
const header = computed(() => {
    return currentStep.value?.header || null
})
const contentItems = computed(() => {
    return currentStep.value?.content || []
})

const isLastStep = computed(() => {
    return props.activeIndex >= props.steps.length - 1
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

const scrollToTop = (toEnd) => {
    const contentSheet = document.getElementById('contentSheet')
    if (!contentSheet) return

    const parentElement = contentSheet.parentElement
    if (!parentElement) return

    const parentHeight = parentElement.clientHeight || 200
    const scrollHeight = contentSheet.scrollHeight

    let targetPosition
    if (toEnd !== undefined) {
        // Jeśli przekazano toEnd, użyj go ale ogranicz do dostępnego zakresu
        targetPosition = scrollHeight - parentHeight - 10
    } else {
        // Standardowe przełączanie między górą a wysokością rodzica
        targetPosition = scrollOffset.value === 0 ? parentHeight : 0
    }

    // Upewnij się, że pozycja nie jest ujemna
    targetPosition = Math.max(0, targetPosition)

    goTo(targetPosition, {
        duration: 300,
        easing: 'easeInOutCubic',
        container: '#contentSheet',
    })
    scrollOffset.value = targetPosition > 0 ? 100 : 0
}

const resetScrollOffset = (event) => {
    if (event && event.target && event.target.scrollTop === 0) {
        scrollOffset.value = 0
    } else {
        scrollOffset.value = 100
    }
}

const goToNextStep = () => {
    emit('next-step')
    isTaskCompleted.value = false
    expansionPanels.value = [0]
}

const goToPresentation = () => {
    router.push('/game')
}

const onTaskCompleted = () => {
    setTimeout(() => {
        const contentSheet = document.getElementById('contentSheet')
        if (contentSheet) {
            scrollToTop(true)
        }
    }, 100)
    isTaskCompleted.value = true
}

const setNextStepActive = () => {
    if (currentStep.value?.view?.duration) {
        setTimeout(() => {
            nextStepActive.value = true
        }, currentStep.value.view.duration)
    } else {
        nextStepActive.value = true
    }
}

onMounted(() => {
    setNextStepActive()
})

watch(
    () => props.activeIndex,
    () => {
        isTaskCompleted.value = false
        setNextStepActive()
    },
)
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
