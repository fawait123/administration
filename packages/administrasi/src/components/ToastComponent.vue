<script setup lang="ts"></script>

<template>
    <Toast position="top-right" group="custom">
        <template #message="slotProps">
            <div class="flex flex-col items-start flex-auto gap-2">
                <span class="font-bold text-[13px]">{{ slotProps.message.summary }}</span>
                <span class="font-normal text-[12px]" v-html="slotProps.message.detail" />
            </div>
        </template>
    </Toast>
</template>
