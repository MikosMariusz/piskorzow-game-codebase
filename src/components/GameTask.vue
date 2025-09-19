<template>
    <div class="game-task">
        <div class="task-text mb-3">
            {{ task.text }}
        </div>
        <v-text-field
            v-model="answer"
            :label="$t('stepView.yourAnswer')"
            variant="outlined"
            class="mb-2"
            @focus="showTipLink = true"
            :error="answer.length > 0 && !isCorrect"
            :success="isCorrect"
        />
        <div
            v-if="task.tip"
            class="tip-link mb-1"
        >
            <a
                v-if="!showTip"
                href="#"
                @click.prevent="showTip = true"
                >{{ $t('stepView.showTip') }}</a
            >
        </div>
        <div
            v-if="showTip && task.tip"
            class="tip-text text-caption text-grey-darken-1"
        >
            {{ task.tip }}
        </div>
        <v-btn
            v-if="isCorrect"
            color="primary"
            class="mt-3"
            @click="emit('next-step')"
            rounded="sm"
            elevation="2"
        >
            {{ $t('stepView.nextStep') }}
        </v-btn>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
    task: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['next-step'])
const answer = ref('')
const showTip = ref(false)
const showTipLink = ref(false)
const isCorrect = computed(() => {
    if (!props.task || !props.task.answers || !Array.isArray(props.task.answers)) return false
    return props.task.answers.some(
        (ans) =>
            typeof ans === 'string' &&
            answer.value.trim().toLowerCase() === ans.trim().toLowerCase(),
    )
})
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
</style>
