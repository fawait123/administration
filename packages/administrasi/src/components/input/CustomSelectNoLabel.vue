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
    optionValue: string
}
const props = withDefaults(defineProps<IInputGroup>(), {
    invalid: false,
    type: 'text',
    placeholder: '',
    label: '',
    errorMessage: '',
    className: ''
})

const model = defineModel()
</script>


<template>
    <div :class="props.className">
        <Select v-model="model" :optionValue="optionValue" :options="options" :optionLabel="optionLabel"
            :placeholder="placeholder" class="w-full" />
        <small :id="props.label" class="text-[10px] text-red-500" v-show="props.invalid">{{ props.errorMessage
            }}</small>
    </div>
</template>
