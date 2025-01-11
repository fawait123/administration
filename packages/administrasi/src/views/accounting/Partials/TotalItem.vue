<script setup lang="ts">
import { formatRupiah } from '@/helpers';

const props = defineProps<{
    data?: Record<string, any>
}>()

</script>

<template>
    <h1 class="font-bold">{{ formatRupiah(Number(props.data?.total)) }}</h1>
</template>
