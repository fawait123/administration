<script setup lang="ts">
import doRequest from '@/helpers/do-request.helper';
import { onMounted, ref } from 'vue';

const notificationRef = ref<Record<string, any>[]>([])
const getCurrentNotification = async () => {
    try {
        const notifications = await doRequest({
            url: '/notification/current',
            method: 'get'
        })

        notificationRef.value = notifications.data
    } catch (error) {
        console.log(error)
    }
}


onMounted(() => {
    getCurrentNotification()
})

</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Pemberitahuan</div>
        </div>

        <span class="block text-muted-color font-semibold mb-4">HARI INI</span>
        <ul class="p-0 mx-0 mt-0 mb-6 list-none grid grid-cols-1 gap-3" v-if="notificationRef.length > 0">
            <li class="flex items-center py-2 border-b border-surface" v-for="notification in notificationRef"
                :key="notification.id">
                <div
                    class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                    <i class="pi pi-dollar !text-xl text-blue-500"></i>
                </div>
                <span class="text-surface-900 dark:text-surface-0 leading-normal" v-html="notification.body"></span>
            </li>
        </ul>
        <div v-else class="flex justify-center items-center flex-col gap-4">
            <h1 class="font-bold text-slate-400">TIDAK ADA AKTIFITAS</h1>
            <span class="pi pi-database text-slate-400" style="font-size: 50px"></span>
        </div>
    </div>
</template>
