<script setup>
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { formatRupiah } from '@/helpers';
const invoices = [
    {
        number: 'INV-123456',
        total: 100000
    },
    {
        number: 'INV-678901',
        total: 200000
    }
]
</script>

<template>
    <div class="grid gap-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInputGroup label="Keterangan" type="text" placeholder="Keterangan" />
            <CustomInputGroup label="Tanggal" type="date" placeholder="Tanggal" />
        </div>
        <div class="gap-4">
            <Button size="small">Tambah</Button>
            <DataTable :value="invoices" tableStyle="min-width: 50rem">
                <Column field="number" header="Nomor Invoice"></Column>
                <Column field="total" header="Jumlah">
                    <template #body="slotProps">
                        {{ formatRupiah(slotProps.data.total) }}
                    </template>
                </Column>
                <template #empty>
                    <h1>Tidak ada data</h1>
                </template>
            </DataTable>
        </div>
    </div>
</template>
