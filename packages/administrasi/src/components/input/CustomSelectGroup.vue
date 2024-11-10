<script lang="ts" setup>
import Select from 'primevue/select';
interface IInputGroup {
    invalid?: boolean,
    type?: string,
    label?: string,
    placeholder?: string,
    errorMessage?: string,
    className?: string,
    options: any[],
    optionLabel: string,
    optionValue: string,
    editable?: boolean,
    loading?: boolean
    disabled?: boolean
}
const props = withDefaults(defineProps<IInputGroup>(), {
    invalid: false,
    type: 'text',
    placeholder: '',
    label: '',
    errorMessage: '',
    className: '',
})

const model = defineModel()
const emmit = defineEmits()

const onShow = () => {
    emmit('onShow')
}

const updateValue = (value: any) => {
    emmit('valueChange', value)
}
</script>


<template>
    <div :class="props.className">
        <label :for="props.label" class="block font-bold">{{ props.label
            }}</label>
        <Select :disabled="props.disabled" :loading="props.loading" v-on:show="onShow" @update:modelValue="updateValue"
            :filter="props.editable" v-model="model" :optionValue="optionValue" :options="options"
            :optionLabel="optionLabel" :placeholder="placeholder" class="w-full" :invalid="props.invalid" />
        <small :id="props.label" class="text-[10px] text-red-500" v-show="props.invalid">{{ props.errorMessage
            }}</small>
    </div>
</template>
