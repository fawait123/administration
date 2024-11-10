<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import { markRaw, onMounted, ref } from 'vue';
import ItemName from './Partial/ItemName.vue';
import ItemDate from './Partial/ItemDate.vue';
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
        field: 'employee',
        header: 'Nama Karyawan',
        sortable: false,
        component: markRaw(ItemName)
    },
    {
        field: 'date',
        header: 'Tanggal Dibuat',
        sortable: false,
        component: markRaw(ItemDate)
    },
])

onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }
})

const onEdit = (data: any) => {
    router.push({ name: 'member-work-result-edit', params: { id: data.id } })
}

</script>


<template>
    <div>
        <DataTableComponent @onEdit="onEdit" get-url="member-work-result" ref="tableRef" :columns="columns"
            :add-button="false" :delete-button="false" />
    </div>
</template>
