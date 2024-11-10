<script setup lang="ts">
import { formatRupiah } from '@/helpers';
import moment from 'moment';

const props = withDefaults(defineProps<{
    title: string,
    total: number,
    persentase?: boolean,
    icon: string
}>(), {
    persentase: false
})
</script>

<template>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">{{ props.title }}</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ props.persentase ?
                        props.total + ' %' : formatRupiah(props.total)
                        }}</div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                    style="width: 2.5rem; height: 2.5rem">
                    <i :class="['pi text-blue-500 !text-xl', props.icon]"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ moment().format('DD MMMM YYYY') }}</span>
            <span class="text-muted-color"> data di update</span>
        </div>
    </div>
</template>
