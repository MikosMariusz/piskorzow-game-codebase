<template>
    <div
        v-if="currentStep"
        class="game-step"
        :style="{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }"
    >
        <GameDialog
            v-model="showDialog"
            @confirm="confirmLeave"
            @cancel="cancelLeave"
        />
        <AppBackground
            v-if="bgImage"
            :image-src="`/stories/${storyId}/${bgImage.src}`"
            :blur="bgImage.blur"
            :style="{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }"
        />
        <div
            id="contentSheet"
            class="step-content pa-5"
            :class="{ 'px-0': $vuetify.display.smAndDown }"
            :style="{
                position: 'relative',
                zIndex: 1,
                height: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
            }"
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
                class="pa-2"
                style="position: relative"
                elevation="4"
                :rounded="$vuetify.display.mdAndUp ? 'lg' : 0"
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
                                :position="currentStep.position"
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
                    :style="{ position: 'absolute', top: '10px', right: '10px', zIndex: 5000 }"
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
import { onBeforeRouteLeave } from 'vue-router'
import GameTask from './GameTask.vue'
import GameDialog from './GameDialog.vue'
import AppBackground from './AppBackground.vue'
import { useGoTo } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'

const expansionPanels = ref([0])
const route = useRoute()
const router = useRouter()
const isGame = computed(() => {
    return route.path.startsWith('/game')
})

const showDialog = ref(false)
let leaveResolve = null

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
    if (isGame.value) {
        localStorage.removeItem(`gameProgress_${props.storyId}`)
    }
    router.push(isGame.value ? '/game' : '/presentation')
}

// Mechanizm blokowania opuszczenia strony gry
const saveGameProgress = () => {
    const key = `gameProgress_${props.storyId}`
    const currentProgress = {
        route: route.fullPath,
        stepIndex: props.activeIndex,
        storyId: props.storyId,
    }
    const saved = localStorage.getItem(key)
    if (saved) {
        try {
            const savedProgress = JSON.parse(saved)
            // Zapisz tylko jeśli nie ma zapisu lub zapisany stepIndex jest niższy
            if (savedProgress.stepIndex >= currentProgress.stepIndex) {
                return
            }
        } catch (e) {}
    }
    localStorage.setItem(key, JSON.stringify(currentProgress))
}

const confirmLeave = () => {
    showDialog.value = false
    saveGameProgress()
    if (leaveResolve) leaveResolve(true)
}
const cancelLeave = () => {
    showDialog.value = false
    if (leaveResolve) leaveResolve(false)
}

const waitForLeaveDialog = () => {
    showDialog.value = true
    return new Promise((resolve) => {
        leaveResolve = resolve
    })
}

onBeforeRouteLeave(async (to, from, next) => {
    if (isGame.value && props.activeIndex > 0 && !isLastStep.value) {
        const result = await waitForLeaveDialog()
        if (result) {
            next()
        } else {
            next(false)
        }
    } else {
        next()
    }
})

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
    window.addEventListener('beforeunload', (e) => {
        if (isGame.value && props.activeIndex > 0 && !isTaskCompleted.value) {
            saveGameProgress()
            e.preventDefault()
            e.returnValue = ''
        }
    })
})

watch(
    () => props.activeIndex,
    () => {
        isTaskCompleted.value = false
        setNextStepActive()
    },
)
</script>
