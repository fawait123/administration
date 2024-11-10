<script lang="ts" setup>
import Password from 'primevue/password';
interface IInputGroup {
    invalid?: boolean,
    type?: string,
    label?: string,
    placeholder?: string,
    errorMessage?: string,
    className?: string,
    readonly?: boolean
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
        <label :for="props.label" class="block font-bold">{{ props.label
            }}</label>
        <Password :id="props.label" :invalid="props.invalid" v-model="model" :placeholder="props.placeholder"
            :toggleMask="true" fluid :feedback="false" :aria-describedby="props.label" class="w-full block"></Password>
        <small :id="props.label" class="text-[10px] text-red-500" v-show="props.invalid">{{ props.errorMessage
            }}</small>
    </div>
</template>
