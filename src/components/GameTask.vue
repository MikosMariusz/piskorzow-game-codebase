<template>
    <div class="game-task">
        <div class="task-text mb-3">
            {{ $t(task.question) }}
        </div>
        <v-text-field
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
            :readonly="fieldReadOnly"
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
            v-if="showTip && task.tip && !fieldReadOnly"
            type="info"
            variant="tonal"
        >
            {{ $t(task.tip) }}
        </v-alert>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
    task: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['task-completed', 'answer-correct'])
const answer = ref('')
const showTip = ref(false)
const showTipLink = ref(false)
const fieldReadOnly = ref(false)
const isCorrect = computed(() => {
    if (!props.task || !props.task.answers || !Array.isArray(props.task.answers)) return false
    return props.task.answers.some(
        (ans) =>
            typeof ans === 'string' &&
            answer.value.trim().toLowerCase() === ans.trim().toLowerCase(),
    )
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

watch(
    isCorrect,
    (newValue) => {
        if (newValue === true) {
            if (navigator.vibrate) {
                navigator.vibrate(100)
            }
            fieldReadOnly.value = true
            emit('task-completed', newValue)
        }
    },
    { immediate: true },
)
</script>

<style scoped>
.game-task {
    display: flex;
    flex-direction: column;
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
