<template>
    <div class="task-section">
        <div class="task-text mb-3">
            {{ task.text }}
        </div>
        <v-text-field
            v-model="answer"
            :label="$t('stepView.yourAnswer')"
            variant="outlined"
            class="mb-2"
            @focus="showTipLink = true"
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
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    task: {
        type: Object,
        required: true,
    },
})
const answer = ref('')
const showTip = ref(false)
const showTipLink = ref(false)
</script>

<style scoped>
.task-section {
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
