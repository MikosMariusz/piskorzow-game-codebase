<template>
    <v-dialog
        v-model="dialogModel"
        persistent
        max-width="500"
    >
        <v-card>
            <v-card-title class="text-h6 font-weight-medium">
                {{ $t(titleKey) }}
            </v-card-title>
            <v-card-text>
                {{ $t(textKey) }}
            </v-card-text>
            <v-card-actions>
                <v-btn
                    color="secondary"
                    @click="onCancel"
                    >{{ $t(cancelKey) }}</v-btn
                >
                <v-spacer />
                <v-btn
                    color="primary"
                    @click="onConfirm"
                    >{{ $t(confirmKey) }}</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
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
