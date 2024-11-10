<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import useValidation from '@/helpers/validation.helper';
import { employeeSchema } from '@/schema/index';
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
        header: 'Nama Pekerja',
        sortable: false
    },
])

onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }
})

const employeeRef = ref({
    name: ''
})

const { validate, isValid, getError, scrolltoError } = useValidation(employeeSchema, employeeRef, {
    mode: 'lazy',
});

const onAdd = () => {
    resetForm()
    modalRef.value = true;
}

const onEdit = (value: any) => {
    dataId.value = value.id
    employeeRef.value = {
        name: value.name,
    }

    modalRef.value = true;
}


const resetForm = () => {
    employeeRef.value = {
        name: '',
    }
    dataId.value = null
}

const handleSubmit = async () => {
    await validate()
    try {
        if (isValid.value) {
            await doRequest({
                url: dataId.value ? '/employee/' + dataId.value : '/employee',
                method: dataId.value ? 'PATCH' : 'POST',
                data: employeeRef.value
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
        <DataTableComponent get-url="employee" @onAdd="onAdd" @onEdit="onEdit" ref="tableRef" :columns="columns" />

        <Dialog v-model:visible="modalRef" :style="{ width: '450px' }" header="Pengguna Details" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Pekerja" label="Pekerja" v-model="employeeRef.name"
                    :invalid="!!getError('name')" :error-message="getError('name')" class-name="mb-8" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="() => modalRef = false" />
                <Button label="Simpan" icon="pi pi-check" @click="handleSubmit" />
            </template>
        </Dialog>
    </div>
</template>
