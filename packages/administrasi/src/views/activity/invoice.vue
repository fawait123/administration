<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import useValidation from '@/helpers/validation.helper';
import { activitySchema } from '@/schema/index';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { onMounted, ref } from 'vue';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';

const modalRef = ref<boolean>(false)
const dataId = ref<string | null>(null)
const toast = useToast();
const tableRef = ref<InstanceType<typeof DataTableComponent> | null>(null)
const columns = ref<IColumnTable[]>([
    {
        field: 'id',
        header: 'ID',
        sortable: false
    },
    {
        field: 'name',
        header: 'Nama Aktifitas',
        sortable: false
    },
])

onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }
})

const activityRef = ref({
    name: '',
    type: 'COMPANY'
})

const { validate, isValid, getError, scrolltoError } = useValidation(activitySchema, activityRef, {
    mode: 'lazy',
});

const onAdd = () => {
    resetForm()
    modalRef.value = true;
}

const onEdit = (value: any) => {
    dataId.value = value.id
    activityRef.value = {
        name: value.name,
        type: 'COMPANY'
    }

    modalRef.value = true;
}


const resetForm = () => {
    activityRef.value = {
        name: '',
        type: 'COMPANY'
    }
    dataId.value = null
}

const handleSubmit = async () => {
    await validate()
    try {
        if (isValid.value) {
            await doRequest({
                url: dataId.value ? '/activity/' + dataId.value : '/activity',
                method: dataId.value ? 'PATCH' : 'POST',
                data: activityRef.value
            })
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data berhasil ' + dataId.value ? 'diubah' : 'ditambah', life: 3000 })
            resetForm()

            if (tableRef.value) {
                tableRef.value.getData()
            }

            modalRef.value = false;
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi kesahalan', detail: error?.message, life: 3000 })
    }
}
</script>


<template>
    <div>
        <DataTableComponent get-url="activity" @onAdd="onAdd" @onEdit="onEdit" ref="tableRef" :columns="columns"
            :params="{ where: { type: 'COMPANY' } }" />

        <Dialog v-model:visible="modalRef" :style="{ width: '450px' }" header="Pengguna Details" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Aktifitas" label="Aktifitas" v-model="activityRef.name"
                    :invalid="!!getError('name')" :error-message="getError('name')" class-name="mb-8" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="() => modalRef = false" />
                <Button label="Simpan" icon="pi pi-check" @click="handleSubmit" />
            </template>
        </Dialog>
    </div>
</template>
