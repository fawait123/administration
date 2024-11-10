<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import { markRaw, onMounted, ref } from 'vue';
import InvoiceItem from './Partials/InvoiceItem.vue';
import FormAddAccount from './Partials/FormAddAccount.vue';

const tableRef = ref<InstanceType<typeof DataTableComponent> | null>(null)
const columns = ref<IColumnTable[]>([
    {
        field: 'id',
        header: 'ID',
        sortable: false
    },
    {
        field: 'invoice.number',
        header: 'Nomor Invoice',
        sortable: false,
        component: markRaw(InvoiceItem)
    },
])

onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }
})

</script>


<template>
    <div class="grid gap-4">
        <FormAddAccount />
        <DataTableComponent get-url="accounting" ref="tableRef" :columns="columns" :add-button="false"
            :delete-button="false" />
    </div>
</template>
