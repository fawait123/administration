<script setup lang="ts">
import doRequest from '@/helpers/do-request.helper';
import { ref } from 'vue';

const dataRef = ref<any[]>([])
const loadingTable = ref<boolean>(false)

const getData = async () => {
    loadingTable.value = true
    try {
        const response = await doRequest({
            method: "get",
            url: "invoice/statuses/APPROVE"
        })

        const data = response.data
        dataRef.value = data;
        loadingTable.value = false
    } catch (error) {
        loadingTable.value = false
    }
}

defineExpose({ getData })
</script>

<template>
    <div>
        <DataTable :value="dataRef" :lazy="true" tableStyle="min-width: 50rem" :loading="loadingTable">
            <template #empty>
                <span class="text-center font-bold">Data tidak ditemukan</span>
            </template>
            <Column field="type" header="Tipe">
                <template #body="slotProps">
                    <span>{{ slotProps.data.type == "activity" ? "Aktifitas" : "Tambahan" }}</span>
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
        </DataTable>
    </div>
</template>
