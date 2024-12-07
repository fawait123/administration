<script setup lang="ts">
import doRequest from '@/helpers/do-request.helper';
import { useLoadingStore } from '@/store';
import { PageState, useToast } from 'primevue';
import { onMounted, ref } from 'vue';
import LoadingComponent from '../../../composable/LoadingComponent.vue';

const toast = useToast();
const store = useLoadingStore();
const notificationRef = ref<Record<string, any>[]>([]);
const paginationRef = ref<{ page: number }>({
    page: 1
});
const first = ref<number>(0);

const getCurrentNotification = async () => {
    store.setLoading(true);
    try {
        const notifications = await doRequest({
            url: '/notification/current',
            method: 'get',
            params: {
                page: paginationRef.value.page,
                limit: 10,
                where: {
                    title: 'Pemberitahuan Pembayaran'
                }
            }
        });

        notificationRef.value = notifications.data;
        store.setLoading(false);
    } catch (error) {
        store.setLoading(false);
        console.log(error);
    }
};

const handleNextPage = (event: PageState) => {
    paginationRef.value = {
        page: event.page + 1
    };
    getCurrentNotification();
};

const downloadExcel = async () => {
    try {
        const response = await doRequest({
            url: '/worksheet/notification',
            method: 'get',
            responseType: 'blob',
            params: {
                page: paginationRef.value.page,
                limit: 10,
                where: {
                    title: 'Pemberitahuan Pembayaran'
                }
            }
        });
        // Create a download link and click it programmatically
        const url = window.URL.createObjectURL(new Blob([response as any], { type: 'blob' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `notification-${new Date()}.xlsx`); // Set the filename for the download
        document.body.appendChild(link);
        link.click();

        // Clean up by revoking the URL object and removing the link
        link?.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.add({ severity: 'success', summary: 'Unduhan Selesai', detail: 'Berhasil mengunduh data', life: 3000 });
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi Kesahalan', detail: error.message, life: 3000 });
    }
};

onMounted(() => {
    getCurrentNotification();
});
</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <span class="font-semibold text-xl">Pemberitahuan</span>
            <Button size="small" @click="downloadExcel">
                <i class="pi pi-download"></i>
                Download Excel
            </Button>
        </div>

        <div v-if="!store.loading">
            <ul class="p-0 mx-0 mt-0 mb-6 list-none grid grid-cols-1 gap-3" v-if="notificationRef?.result?.length > 0">
                <li class="flex items-center py-2 border-b border-surface"
                    v-for="notification in notificationRef.result" :key="notification.id">
                    <div
                        class="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full mr-4 shrink-0">
                        <i class="pi pi-dollar !text-xl text-blue-500"></i>
                    </div>
                    <span class="text-surface-900 dark:text-surface-0 leading-normal" v-html="notification.body"></span>
                </li>
                <Paginator v-model:first="first" :rows="10" :totalRecords="notificationRef?.count || 0"
                    template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="Menampilkan {first} ke {last} dari {totalRecords}"
                    @page="handleNextPage" />
            </ul>
            <div v-else class="flex justify-center items-center flex-col gap-4">
                <h1 class="font-bold text-slate-400">TIDAK ADA AKTIFITAS</h1>
                <span class="pi pi-database text-slate-400" style="font-size: 50px"></span>
            </div>
        </div>
        <LoadingComponent v-else />
    </div>
</template>
