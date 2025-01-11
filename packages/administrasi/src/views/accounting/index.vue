<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import { markRaw, onMounted, ref } from 'vue';
import InvoiceItem from './Partials/InvoiceItem.vue';
import FormAddAccount from './Partials/FormAddAccount.vue';
import TotalItem from './Partials/TotalItem.vue';
import PercentageItem from './Partials/PercentageItem.vue';
import ProfitItem from './Partials/ProfitItem.vue';
import { useRouter } from 'vue-router';

const route = useRouter()

const tableRef = ref<InstanceType<typeof DataTableComponent> | null>(null)
const columns = ref<IColumnTable[]>([
    {
        field: 'id',
        header: 'ID',
        sortable: false
    },
    {
        field: 'accountName',
        header: 'Nama Akun',
        sortable: false,
        component: markRaw(InvoiceItem)
    },
    {
        field: 'total',
        header: 'Total',
        sortable: false,
        component: markRaw(TotalItem)
    },
    {
        field: 'percentage',
        header: 'Percentage',
        sortable: false,
        component: markRaw(PercentageItem)
    },
    {
        field: 'profit',
        header: 'Keutungan',
        sortable: false,
        component: markRaw(ProfitItem)
    }
])
const visible = ref<boolean>(false)

const showDrawerAdd = () => {
    route.push({ name: 'accounting-create' })
}

const onEdit = (value: any) => {
    route.push({ name: 'accounting-edit', params: { id: value.id } })
}

onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }
})

</script>


<template>
    <div class="grid gap-4">
        <Drawer v-model:visible="visible" header="Tambah Laba Rugi" position="right" class="min-w-[60vw] max-w-[60vw]">
            <FormAddAccount />
        </Drawer>
        <DataTableComponent get-url="accounting" ref="tableRef" :columns="columns" :add-button="true"
            @onAdd="showDrawerAdd" :delete-button="false" @onEdit="onEdit" />
    </div>
</template>
