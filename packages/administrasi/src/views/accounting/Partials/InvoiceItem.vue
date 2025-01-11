<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()
const props = defineProps<{
    data?: Record<string, any>
}>()


const gotoDetail = () => {
    router.push({
        name: 'accounting-detail',
        params: {
            id: props?.data?.id
        }
    })
}
</script>

<template>
    <h1 class="text-blue-500 cursor-pointer font-bold" @click="gotoDetail">{{ props.data?.accountName }}</h1>
</template>
