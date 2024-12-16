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
const visible = ref<boolean>(false)

onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }
})

const showDrawerAdd = () => {
    visible.value = true
}

</script>


<template>
    <div class="grid gap-4">
        <Drawer v-model:visible="visible" header="Tambah Laba Rugi" position="right" class="min-w-[60vw] max-w-[60vw]">
            <FormAddAccount />
        </Drawer>
        <DataTableComponent get-url="accounting" ref="tableRef" :columns="columns" :add-button="true"
            @onAdd="showDrawerAdd" :delete-button="false" />
    </div>
</template>
