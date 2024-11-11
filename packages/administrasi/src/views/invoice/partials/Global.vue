<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import { markRaw, ref } from 'vue';
import InvoiceItem from './InvoiceItem.vue';
import InvoiceType from './InvoiceType.vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const tableRef = ref<InstanceType<typeof DataTableComponent> | null>(null)
const columns = ref<IColumnTable[]>([
    {
        field: 'id',
        header: 'ID',
        sortable: false
    },
    {
        field: 'number',
        header: 'Nomor Invoice',
        sortable: false,
        component: markRaw(InvoiceItem)
    },
    {
        field: 'type',
        header: 'Tipe Invoice',
        sortable: false,
        component: markRaw(InvoiceType)
    },
])

const handleEdit = (data: Record<string, any>) => {
    router.push({ name: 'invoice-edit', params: { id: data.id } },)
}


defineExpose({ tableRef })
</script>


<template>
    <div>
        <DataTableComponent @onEdit="handleEdit" get-url="invoice" ref="tableRef" :columns="columns" :add-button="false"
            :delete-button="false" />
    </div>
</template>
