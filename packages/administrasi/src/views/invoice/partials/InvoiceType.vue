<script setup lang="ts">
import { useRouter } from 'vue-router';
const props = defineProps<{
    data?: Record<string, any>
}>()

</script>

<template>
    <span class="text-yellow-700 bg-yellow-200 font-bold py-1 px-2 rounded-2xl">{{ props?.data?.type == "ACTIVITY" ?
        "AKTIFITAS" :
        "TAMBAHAN"
        }}</span>
</template>
