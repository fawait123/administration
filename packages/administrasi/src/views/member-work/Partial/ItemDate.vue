<script setup lang="ts">
import moment from 'moment';

const props = defineProps<{
    data?: Record<string, any>
}>()
</script>

<template>
    <span class="text-yellow-700 bg-yellow-200 font-bold py-1 px-2 rounded-2xl">{{ moment(props?.data?.date).format(`DD
        MMMM
        YYYY`)
        }}</span>
</template>
