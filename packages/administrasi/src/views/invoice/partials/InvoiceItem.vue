<script setup lang="ts">
import { useRouter } from 'vue-router';
const props = defineProps<{
    data?: Record<string, any>
}>()

const router = useRouter()

const gotoDetail = () => {
    router.push({
        name: 'invoice-detail',
        params: {
            id: props?.data?.id
        }
    })
}
</script>

<template>
    <span @click="gotoDetail" class="text-blue-500 cursor-pointer font-bold">{{ props?.data?.number }}</span>
</template>
