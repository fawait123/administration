<script setup lang="ts">
import { formatRupiah, ResponseMessage } from '@/helpers';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();
const invoice = ref<any>({});
const tax = ref<number>(0);

const totalActivities = computed(() => {
    return invoice.value?.invoiceActivities?.reduce((prev: any, next: any) => prev + next.total, 0);
});

const totalRetensi = computed(() => {
    return invoice.value?.invoiceRetensi?.reduce((prev: any, next: any) => prev + next.amount, 0);
});

const totalAdditionals = computed(() => {
    return invoice.value?.invoiceAdditionals?.reduce((prev: any, next: any) => prev + next.amount, 0);
});

const totalTax = computed(() => {
    return invoice.value?.invoiceActivities?.length > 0 ? (tax.value * totalActivities.value) / 100 : (tax.value * totalAdditionals.value) / 100;
});

const totalPembayaran = computed(() => {
    return invoice.value?.invoiceActivities?.length > 0 ? totalActivities.value - totalTax.value : totalAdditionals.value - totalTax.value;
});

onMounted(() => {
    getData();
    getTax();
});

const getData = async () => {
    try {
        const response = await doRequest({
            url: 'invoice/' + route.params.id
        });
        invoice.value = response.data;
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Opps!', detail: ResponseMessage.message(error), life: 3000 });
    }
};

const getTax = async () => {
    try {
        const response = await doRequest({
            url: 'setting/tax'
        });
        tax.value = response.data.amount;
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Opps!', detail: ResponseMessage.message(error), life: 3000 });
    }
};

const downloadExcel = async () => {
    if (invoice.value?.type == 'ACTIVITY') {
        await downloadAcivity();
    } else {
        await downloadAdditionals();
    }
};

const downloadAcivity = async () => {
    try {
        const response = await doRequest({
            url: '/worksheet/invoice-activity/' + route.params.id,
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
        toast.add({ severity: 'success', summary: 'Unduhan Selesai', detail: 'Berhasil mengunduh data', life: 3000 });
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi Kesahalan', detail: error.message, life: 3000 });
    }
};

const downloadAdditionals = async () => {
    try {
        const response = await doRequest({
            url: '/worksheet/invoice-additional/' + route.params.id,
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
        toast.add({ severity: 'success', summary: 'Unduhan Selesai', detail: 'Berhasil mengunduh data', life: 3000 });
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi Kesahalan', detail: error.message, life: 3000 });
    }
};
</script>

<template>
    <div>
        <Card>
            <template #title>
                <div class="flex justify-between items-center">
                    <span>Detail Invoice</span>
                    <Button @click="downloadExcel">
                        Export Excel
                        <i class="pi pi-download"></i>
                    </Button>
                </div>
            </template>
            <template #subtitle>
                <span>Berikut rincian detail invoice</span>
            </template>
            <template #content>
                <div class="my-8 grid gap-4">
                    <div class="grid gap-4">
                        <h6 class="text-[18px] font-bold">Data Invoice</h6>
                        <div>
                            <DataTable
                                :value="invoice.invoiceActivities"
                                size="large"
                                :rowHover="true"
                                :lazy="true"
                                v-if="invoice?.invoiceActivities?.length > 0"
                                :rowStyle="({ status }) => (status == 'APPROVE' ? { background: '#79bed9', color: 'white' } : status == 'REJECT' ? { background: '#d98494', color: 'white' } : {})"
                            >
                                <Column field="bapNumber" header="No. BAP/SPK"></Column>
                                <Column field="zone" header="COMPT/ZONA"></Column>
                                <Column field="activity.name" header="Aktifitas"></Column>
                                <Column field="wide" header="Luas"></Column>
                                <Column field="price" header="Harga">
                                    <template #body="slotProps">
                                        <span>{{ formatRupiah(slotProps.data.price) }}</span>
                                    </template>
                                </Column>
                                <Column field="total" header="Jumlah">
                                    <template #body="slotProps">
                                        <span>{{ formatRupiah(slotProps.data.total) }}</span>
                                    </template>
                                </Column>
                                <template #empty>
                                    <div class="flex flex-col gap-4">
                                        <h1 class="font-bold text-[16px] text-slate-400">DATA TIDAK DITEMUKAN</h1>
                                        <i class="pi pi-database text-slate-400" style="font-size: 50px"></i>
                                    </div>
                                </template>
                            </DataTable>
                            <DataTable
                                :value="invoice.invoiceAdditionals"
                                size="large"
                                :rowHover="true"
                                :lazy="true"
                                :rowStyle="({ status }) => (status == 'APPROVE' ? { background: '#79bed9', color: 'white' } : status == 'REJECT' ? { background: '#d98494', color: 'white' } : {})"
                                v-else
                            >
                                <Column field="bapNumber" header="No. BAP/SPK"></Column>
                                <Column field="activity.name" header="Aktifitas"></Column>
                                <Column field="amount" header="BAP Amount DPP">
                                    <template #body="slotProps">
                                        <span>{{ formatRupiah(slotProps.data.amount) }}</span>
                                    </template>
                                </Column>
                                <template #empty>
                                    <div class="flex flex-col gap-4">
                                        <h1 class="font-bold text-[16px] text-slate-400">DATA TIDAK DITEMUKAN</h1>
                                        <i class="pi pi-database text-slate-400" style="font-size: 50px"></i>
                                    </div>
                                </template>
                            </DataTable>
                            <DataTable
                                :value="invoice.invoiceAdditionals"
                                size="large"
                                :rowHover="true"
                                :lazy="true"
                                :rowStyle="({ status }) => (status == 'APPROVE' ? { background: '#79bed9', color: 'white' } : status == 'REJECT' ? { background: '#d98494', color: 'white' } : {})"
                                v-else
                            >
                                <Column field="bapNumber" header="No. BAP/SPK"></Column>
                                <Column field="activity.name" header="Aktifitas"></Column>
                                <Column field="amount" header="BAP Amount DPP">
                                    <template #body="slotProps">
                                        <span>{{ formatRupiah(slotProps.data.amount) }}</span>
                                    </template>
                                </Column>
                                <template #empty>
                                    <div class="flex flex-col gap-4">
                                        <h1 class="font-bold text-[16px] text-slate-400">DATA TIDAK DITEMUKAN</h1>
                                        <i class="pi pi-database text-slate-400" style="font-size: 50px"></i>
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </div>
                    <div class="grid gap-4" v-if="invoice?.invoiceRetensi?.length > 0">
                        <h6 class="text-[18px] font-bold">Data Retensi</h6>
                        <div>
                            <DataTable
                                :value="invoice.invoiceRetensi"
                                size="large"
                                :rowHover="true"
                                :lazy="true"
                                :rowStyle="({ status }) => (status == 'APPROVE' ? { background: '#79bed9', color: 'white' } : status == 'REJECT' ? { background: '#d98494', color: 'white' } : {})"
                            >
                                <Column field="note" header="Keterangan"></Column>
                                <Column field="amount" header="Jumlah">
                                    <template #body="slotProps">
                                        <span>{{ formatRupiah(slotProps.data.amount) }}</span>
                                    </template>
                                </Column>
                                <template #empty>
                                    <div class="flex flex-col gap-4">
                                        <h1 class="font-bold text-[16px] text-slate-400">DATA TIDAK DITEMUKAN</h1>
                                        <i class="pi pi-database text-slate-400" style="font-size: 50px"></i>
                                    </div>
                                </template>
                            </DataTable>
                        </div>
                    </div>
                    <div class="flex items-end flex-col gap-4 my-10">
                        <div class="min-w-[400px] max-w-[400px] grid grid-cols-2 border-b p-2">
                            <span class="font-bold text-[14px]">TOTAL</span>
                            <span class="font-bold text-[14px]">{{ invoice?.invoiceActivities?.length > 0 ? formatRupiah(totalActivities) : formatRupiah(totalAdditionals) }}</span>
                        </div>
                        <div class="min-w-[400px] max-w-[400px] grid grid-cols-2 border-b p-2" v-if="invoice?.invoiceRetensi?.length > 0">
                            <span class="font-bold text-[14px]">TOTAL RETENSI</span>
                            <span class="font-bold text-[14px]">{{ formatRupiah(totalRetensi) }}</span>
                        </div>
                        <div class="min-w-[400px] max-w-[400px] grid grid-cols-2 border-b p-2">
                            <span class="font-bold text-[14px]">PPN {{ tax }}%</span>
                            <span class="font-bold text-[14px]">{{ formatRupiah(totalTax) }}</span>
                        </div>
                        <div class="min-w-[400px] max-w-[400px] grid grid-cols-2 border-b p-2">
                            <span class="font-bold text-[14px]">TOTAL PEMBAYARAN</span>
                            <span class="font-bold text-[14px]">{{ invoice?.invoiceRetensi?.length > 0 ? formatRupiah(totalPembayaran - totalRetensi) : formatRupiah(totalPembayaran) }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
