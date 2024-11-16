<script setup lang="ts">
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const dataRef = ref<any[]>([]);
const toast = useToast();
const loadingTable = ref<boolean>(false);

const getData = async () => {
    loadingTable.value = true;
    try {
        const response = await doRequest({
            method: 'get',
            url: 'invoice/statuses/NEEDAPPROVAL'
        });

        const data = response.data;
        dataRef.value = data;
        loadingTable.value = false;
    } catch (error) {
        loadingTable.value = false;
    }
};

const onApprove = async (data: any) => {
    try {
        await doRequest({
            url: 'invoice/adjusment',
            method: 'post',
            data: {
                type: data.type,
                id: data.id,
                status: 'APPROVE'
            }
        });

        getData();
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Berhasil approve data ' + data.bapNumber });
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Opps!', detail: error.message });
    }
};

const onReject = async (data: any) => {
    try {
        await doRequest({
            url: 'invoice/adjusment',
            method: 'post',
            data: {
                type: data.type,
                id: data.id,
                status: 'REJECT'
            }
        });

        getData();

        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Berhasil reject data ' + data.bapNumber });
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Opps!', detail: error.message });
    }
};

defineExpose({ getData });
</script>

<template>
    <div>
        <DataTable :value="dataRef" :lazy="true" tableStyle="min-width: 50rem" :loading="loadingTable">
            <template #empty>
                <span class="text-center font-bold">Data tidak ditemukan</span>
            </template>
            <Column field="type" header="Tipe">
                <template #body="slotProps">
                    <span>{{ slotProps.data.type == 'activity' ? 'Aktifitas' : 'Tambahan' }}</span>
                </template>
            </Column>
            <Column field="Invoice.number" header="Nomor Invoice"></Column>
            <Column field="bapNumber" header="No. BAP/SPK"></Column>
            <Column field="activity.name" header="Aktifitas"></Column>
            <Column field="zone" header="COMPT/ZONA"></Column>
            <Column field="wide" header="Luas"></Column>
            <Column field="price" header="Harga">
                <template #body="slotProps">
                    <span>Rp. {{ slotProps.data.price.toLocaleString('id') }}</span>
                </template>
            </Column>
            <Column field="total" header="Total">
                <template #body="slotProps">
                    <span>Rp. {{ slotProps.data.total.toLocaleString('id') }}</span>
                </template>
            </Column>
            <Column field="total" header="#">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button severity="success" size="small" @click="onApprove(slotProps.data)">
                            <span class="pi pi-check"></span>
                        </Button>
                        <Button severity="danger" size="small" @click="onReject(slotProps.data)">
                            <span class="pi pi-times"></span>
                        </Button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
