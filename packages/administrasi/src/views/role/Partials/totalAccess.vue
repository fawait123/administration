<script setup lang="ts">
const props = defineProps<{
    data: Record<string, any>
}>()
</script>

<template>
    <span class="font-bold">{{ props.data?.access?.length }}</span>
</template>
