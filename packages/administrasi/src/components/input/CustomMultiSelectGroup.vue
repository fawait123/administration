<script lang="ts" setup>
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
    editable?: boolean
}
const props = withDefaults(defineProps<IInputGroup>(), {
    invalid: false,
    type: 'text',
    placeholder: '',
    label: '',
    errorMessage: '',
    className: '',
})

const emmit = defineEmits()


const handleInput = () => {
    emmit('handleChange')
}

const model = defineModel()
</script>


<template>
    <div :class="props.className">
        <label :for="props.label" class="block font-bold">{{ props.label
            }}</label>
        <MultiSelect @change="handleInput" v-model="model" :options="options" :optionLabel="optionLabel"
            :optionValue="optionValue" filter :placeholder="placeholder" :maxSelectedLabels="3" class="w-full"
            :invalid="props.invalid" />
        <small :id="props.label" class="text-[10px] text-red-500" v-show="props.invalid">{{ props.errorMessage
            }}</small>
    </div>
</template>
