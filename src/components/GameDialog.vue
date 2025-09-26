<template>
    <v-dialog
        v-model="dialogModel"
        persistent
        max-width="500"
    >
        <AppCard :has-border="true">
            <template #header>
                <div
                    class="d-flex align-center justify-space-between pa-4 pt-3"
                    style="height: 64px; min-height: 64px; max-height: 64px"
                >
                    <span
                        class="text-h6 header-title font-weight-light text-truncate"
                        style="z-index: 3"
                        >{{ $t(titleKey) }}</span
                    >
                </div>
            </template>
            <div class="pa-4">
                <div
                    class="mb-4"
                    style="z-index: 3"
                >
                    {{ $t(textKey) }}
                </div>
                <div class="d-flex justify-end align-center">
                    <GameButton
                        :label="cancelKey"
                        color="secondary"
                        :action="onCancel"
                    />
                    <v-spacer />
                    <GameButton
                        :label="confirmKey"
                        color="primary"
                        :action="onConfirm"
                    />
                </div>
            </div>
        </AppCard>
    </v-dialog>
</template>

<script setup>
import AppCard from '@/components/AppCard.vue'
import GameButton from '@/components/GameButton.vue'
import { computed } from 'vue'
const props = defineProps({
    modelValue: Boolean,
    titleKey: {
        type: String,
        default: 'stepView.leaveDialogTitle',
    },
    textKey: {
        type: String,
        default: 'stepView.leaveDialogText',
    },
    confirmKey: {
        type: String,
        default: 'stepView.leaveDialogYes',
    },
    cancelKey: {
        type: String,
        default: 'stepView.leaveDialogNo',
    },
})
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])
const dialogModel = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    },
})
const onConfirm = () => {
    emit('confirm')
    dialogModel.value = false
}
const onCancel = () => {
    emit('cancel')
    dialogModel.value = false
}
</script>
