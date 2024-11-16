<script setup lang="ts">
import { formatRupiah, ResponseMessage } from '@/helpers';
import doRequest from '@/helpers/do-request.helper';
import { useLoadingStore } from '@/store';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();
const memberWorkResult = ref<any>({});

const store = useLoadingStore();

onMounted(() => {
    getData();
});

const getData = async () => {
    try {
        const response = await doRequest({
            url: 'member-work-result/' + route.params.id
        });
        memberWorkResult.value = response.data;
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Opps!', detail: ResponseMessage.message(error), life: 3000 });
    }
};

const total = computed(() => {
    return memberWorkResult?.value?.activities?.reduce((prev: any, next: any) => {
        return prev + next.subTotal;
    }, 0);
});

const totalBon = computed(() => {
    return memberWorkResult?.value?.bon?.reduce((prev: any, next: any) => {
        return prev + next.total;
    }, 0);
});

const downloadExcel = async () => {
    store.setLoading(true);
    try {
        const response = await doRequest({
            url: '/worksheet/member-work-result/' + route.params.id,
            method: 'get',
            responseType: 'blob'
        });
        // Create a download link and click it programmatically
        const url = window.URL.createObjectURL(new Blob([response as any], { type: 'blob' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `memberworkresult-${new Date()}.xlsx`); // Set the filename for the download
        document.body.appendChild(link);
        link.click();

        // Clean up by revoking the URL object and removing the link
        link?.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        store.setLoading(false);
        toast.add({ severity: 'success', summary: 'Unduhan Selesai', detail: 'Berhasil mengunduh data', life: 3000 });
    } catch (error: any) {
        store.setLoading(false);
        toast.add({ severity: 'error', summary: 'Terjadi Kesahalan', detail: error.message, life: 3000 });
    }
};
</script>

<template>
    <div>
        <Card>
            <template #title>
                <div class="flex justify-between items-center" @click="downloadExcel">
                    <span>Detail Aktifitas Pekerja</span>
                    <Button :loading="store.loading"> Unduh Excel <i class="pi pi-download"></i> </Button>
                </div>
            </template>
            <template #subtitle>
                <span>Berikut rincian detail aktifitas pekerja</span>
            </template>
            <template #content>
                <div class="my-8">
                    <h6 class="text-[18px] font-bold">Data Aktifitas</h6>
                    <DataTable
                        :value="memberWorkResult.activities"
                        size="large"
                        :rowHover="true"
                        :lazy="true"
                        :rowStyle="({ approve, reject }) => (approve == true ? { background: '#79bed9', color: 'white' } : reject == true ? { background: '#d98494', color: 'white' } : {})"
                    >
                        <Column field="activity.name" header="Aktifitas"></Column>
                        <Column field="plot" header="Petak"></Column>
                        <Column field="wide" header="Luas"></Column>
                        <Column field="ql" header="QL"></Column>
                        <Column field="price" header="Harga">
                            <template #body="slotProps">
                                <span>{{ formatRupiah(slotProps.data.price) }}</span>
                            </template>
                        </Column>
                        <Column field="subTotal" header="Sub Total">
                            <template #body="slotProps">
                                <span>{{ formatRupiah(slotProps.data.subTotal) }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
                <div class="my-8">
                    <h6 class="text-[18px] font-bold">Data BON</h6>
                    <DataTable :value="memberWorkResult.bon" size="large" :rowHover="true" :lazy="true">
                        <Column field="note" header="Keterangan"></Column>
                        <Column field="total" header="Total">
                            <template #body="slotProps">
                                <span>{{ formatRupiah(slotProps.data.total) }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
            <template #footer>
                <div class="my-8 flex justify-end">
                    <div>
                        <div class="grid grid-cols-2 my-4 gap-40">
                            <span class="font-semibold text-[14px] text-red-500">Total BON</span>
                            <span class="font-semibold text-[14px] text-red-500"> {{ formatRupiah(totalBon) }}</span>
                        </div>
                        <hr />
                        <div class="grid grid-cols-2 my-4 gap-40">
                            <span class="font-semibold text-[14px] text-blue-500">Sub Total</span>
                            <span class="font-semibold text-[14px] text-blue-500"> {{ formatRupiah(total) }}</span>
                        </div>
                        <hr />
                        <div class="grid grid-cols-2 my-4 gap-40">
                            <span class="font-semibold text-[14px]">Total Bersih</span>
                            <span class="font-semibold text-[14px]"> {{ formatRupiah(total - totalBon) }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
