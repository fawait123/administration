<script lang="ts" setup>
import Checkbox from 'primevue/checkbox';
import Textarea from 'primevue/textarea';
interface IInputGroup {
    invalid?: boolean,
    type?: string,
    label?: string,
    placeholder?: string,
    errorMessage?: string,
    className?: string
    value: string
    childLabel?: string
}
const props = withDefaults(defineProps<IInputGroup>(), {
    invalid: false,
    type: 'text',
    placeholder: '',
    label: '',
    errorMessage: '',
    className: '',
    value: '',
    childLabel: ''
})

const model = defineModel()
</script>


<template>
    <div :class="props.className">
        <label :for="props.label" class="block font-bold">{{ props.label
            }}</label>
        <div class="flex items-center">
            <RadioButton v-model="model" :inputId="props.value" :value="props.value" />
            <label :for="props.value" class="ml-2">{{ props.childLabel }}</label>
        </div>
        <small :id="props.label" class="text-[10px] text-red-500" v-show="props.invalid">{{ props.errorMessage
            }}</small>
    </div>
</template>