<template>
    <div class="game-task">
        <div
            v-if="!showAccuracyMessage"
            key="task"
        >
            <div class="task-text mb-3">
                {{ $t(task.question) }}
            </div>
            <v-img
                v-if="task.image"
                :src="`/stories/${storyId}/${task.image.src}`"
                :alt="task.image.alt || 'Obraz'"
                class="rounded-sm elevation-4 mb-4"
                :style="task.image.blur ? 'filter: blur(3px);' : ''"
                contain
            />
            <v-text-field
                v-if="task.answers"
                v-model="answer"
                :label="$t('task.yourAnswer')"
                density="compact"
                variant="outlined"
                class="mb-2"
                :class="{ 'success-field': isCorrect }"
                @focus="showTipLink = true"
                :error="answer.length > 0 && !isCorrect"
                :success="isCorrect"
                :rules="validationRules"
                :prepend-inner-icon="isCorrect ? 'mdi-thumb-up-outline' : undefined"
            />

            <div
                v-if="task.tip"
                class="tip-link mb-1"
            >
                <a
                    v-if="!showTip"
                    href="#"
                    @click.prevent="showTip = true"
                    >{{ $t('task.showTip') }}</a
                >
            </div>
            <v-alert
                v-if="showTip && task.tip"
                type="info"
                variant="tonal"
            >
                {{ $t(task.tip) }}
            </v-alert>
        </div>
        <div
            v-else
            key="message"
            class=""
        >
            <div class="task-text mb-3">
                {{ $t(task.question) }}
            </div>
            <v-img
                v-if="task.image"
                :src="`/stories/${storyId}/${task.image.src}`"
                :alt="task.image.alt || 'Obraz'"
                class="rounded-sm elevation-4 mb-4"
                contain
            />
            <v-alert
                color="warning"
                variant="tonal"
                class="mb-3"
            >
                <div class="text-center">
                    <v-icon
                        size="48"
                        class="mb-2"
                        >mdi-map-marker-distance</v-icon
                    >
                    <div class="text-h6 mb-2">{{ $t('task.approachTarget') }}</div>
                    <div class="text-h4 font-weight-bold">
                        {{ remainingDistance }} {{ $t('task.meters') }}
                    </div>
                </div>
            </v-alert>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { getDistance } from 'ol/sphere'
const appStore = useAppStore()
const { t } = useI18n()

onMounted(() => {
    console.log('Komponent GameTask został zamontowany', appStore.getUserGpsPosition)
})

const props = defineProps({
    storyId: {
        type: String,
        required: true,
    },
    task: {
        type: Object,
        required: true,
    },
    accuracy: {
        type: Number,
        required: false,
        default: null,
    },
    feature: {
        type: Object,
        required: false,
        default: null,
    },
    hiddenPosition: {
        type: Array,
        required: false,
        default: null,
    },
})
const emit = defineEmits(['task-completed', 'answer-correct'])
const answer = ref('')
const showTip = ref(false)
const showTipLink = ref(false)
const showAccuracyMessage = ref(false)
const remainingDistance = ref(0)
const isCorrect = computed(() => {
    if (props.task.answers && Array.isArray(props.task.answers)) {
        // Zadanie tekstowe: sprawdź odpowiedź
        return props.task.answers.some(
            (ans) =>
                typeof ans === 'string' &&
                answer.value.trim().toLowerCase() === ans.trim().toLowerCase(),
        )
    } else {
        // Zadanie GPS: sprawdź odległość
        if (
            (!props.feature && !props.hiddenPosition) ||
            !props.accuracy ||
            !appStore.getUserGpsPosition
        ) {
            return false
        }

        let points = []

        if (props.feature) {
            const geom = props.feature.geometry
            if (geom.type === 'Polygon') {
                points = geom.coordinates[0]
            } else if (geom.type === 'LineString') {
                points = geom.coordinates
            } else {
                return false
            }
        } else if (props.hiddenPosition) {
            points = [props.hiddenPosition]
        } else {
            return false
        }

        const userCoord = [appStore.getUserGpsPosition.lon, appStore.getUserGpsPosition.lat]
        const gpsAccuracy = appStore.getUserGpsPosition.accuracy || 20
        let minDistance = Infinity

        for (const point of points) {
            const distance = getDistance(userCoord, point)
            if (distance < minDistance) {
                minDistance = distance
            }
        }

        const effectiveDistance = Math.max(0, minDistance - gpsAccuracy)
        return effectiveDistance <= props.accuracy
    }
})

const validationRules = computed(() => {
    return [
        (value) => {
            if (!value || value.trim() === '') return true // Nie waliduj pustych pól

            // Sprawdź czy odpowiedź jest poprawna
            const correct = props.task.answers?.some(
                (ans) =>
                    typeof ans === 'string' &&
                    value.trim().toLowerCase() === ans.trim().toLowerCase(),
            )

            // Jeśli niepoprawna, zwróć komunikat błędu
            if (!correct && props.task.incorrectMessage) {
                return t(props.task.incorrectMessage)
            }

            return true // Poprawna odpowiedź
        },
    ]
})

const computeDistance = () => {
    if (
        (!props.feature && !props.hiddenPosition) ||
        !props.accuracy ||
        !appStore.getUserGpsPosition
    ) {
        showAccuracyMessage.value = false
        return
    }

    let points = []

    if (props.feature) {
        const geom = props.feature.geometry
        if (geom.type === 'Polygon') {
            points = geom.coordinates[0]
        } else if (geom.type === 'LineString') {
            points = geom.coordinates
        } else {
            showAccuracyMessage.value = false
            return
        }
    } else if (props.hiddenPosition) {
        points = [props.hiddenPosition]
    } else {
        showAccuracyMessage.value = false
        return
    }

    const userCoord = [appStore.getUserGpsPosition.lon, appStore.getUserGpsPosition.lat]
    const gpsAccuracy = 20 // Stała dokładność GPS dla symulacji
    let minDistance = Infinity

    for (const point of points) {
        const distance = getDistance(userCoord, point)
        if (distance < minDistance) {
            minDistance = distance
        }
    }

    const effectiveDistance = Math.max(0, minDistance - gpsAccuracy)
    const hasAccuracy = effectiveDistance <= props.accuracy
    showAccuracyMessage.value = !hasAccuracy
    remainingDistance.value = hasAccuracy ? 0 : Math.ceil(effectiveDistance - props.accuracy)
}

watch(
    isCorrect,
    (newValue) => {
        if (newValue === true) {
            if (navigator.vibrate) {
                navigator.vibrate(100)
            }
            emit('task-completed', newValue)
        }
    },
    { immediate: true },
)

watch(
    () => appStore.getUserGpsPosition,
    () => {
        computeDistance()
    },
    { immediate: true },
)
</script>

<style scoped>
.accuracy-message {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

/* Animacje przełączania */
.task-transition-enter-active,
.task-transition-leave-active {
    transition: all 0.5s ease;
}

.task-transition-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.task-transition-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.task-transition-enter-to,
.task-transition-leave-from {
    opacity: 1;
    transform: translateY(0);
}
.tip-link {
    font-size: 0.9em;
}
.tip-link a {
    color: #1976d2;
    cursor: pointer;
    text-decoration: underline;
}
.tip-text {
    margin-top: 4px;
    color: #757575;
}

/* Stylowanie pola przy poprawnej odpowiedzi */
.success-field :deep(.v-field) {
    background-color: rgba(76, 175, 80, 0.08);
    border-color: #4caf50 !important;
}

.success-field :deep(.v-field--focused) {
    border-color: #4caf50 !important;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.success-field :deep(.v-field__prepend-inner .v-icon) {
    color: #4caf50;
    animation: thumbUp 0.5s ease-in-out;
}

@keyframes thumbUp {
    0% {
        transform: scale(0) rotate(-10deg);
        opacity: 0;
    }
    50% {
        transform: scale(1.2) rotate(5deg);
        opacity: 1;
    }
    100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
    }
}
</style>
