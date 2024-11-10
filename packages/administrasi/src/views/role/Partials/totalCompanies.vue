<script setup lang="ts">
const props = defineProps<{
    data: Record<string, any>
}>()
</script>

<template>
    <span class="font-bold">{{ props.data?.companies?.length }}</span>
</template>
