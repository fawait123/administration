<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
interface IInputGroup {
    invalid?: boolean,
    type?: string,
    label?: string,
    placeholder?: string,
    errorMessage?: string,
    className?: string,
    name?: string
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
        <InputText :id="props.label" :name="name" :type="props.type" :invalid="props.invalid"
            :placeholder="props.placeholder" class="w-full block" v-model="model" :aria-describedby="props.label"
            v-if="type !== 'password'" />
        <Password :id="props.label" :invalid="props.invalid" v-model="model" v-else :placeholder="props.placeholder"
            :toggleMask="true" fluid :feedback="false" :aria-describedby="props.label" class="w-full block"></Password>
        <small :id="props.label" class="text-[10px] text-red-500" v-show="props.invalid">{{ props.errorMessage
            }}</small>
    </div>
</template>
