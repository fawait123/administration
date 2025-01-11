<script setup lang="ts">
import { formatRupiah } from '@/helpers';

const props = defineProps<{
    data?: Record<string, any>
}>()

</script>

<template>
    <h1 class="font-bold">{{ props.data?.percentage }}%</h1>
</template>
