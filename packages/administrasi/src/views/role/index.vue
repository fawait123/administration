<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import useValidation from '@/helpers/validation.helper';
import { roleSchema } from '@/schema/index';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { onMounted, ref, shallowRef } from 'vue';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';
import AccessItem from './Partials/accessItem.vue';
import { useCompanyStore } from '@/store';
import CustomMultiSelectGroup from '@/components/input/CustomMultiSelectGroup.vue';
import TotalAccess from './Partials/totalAccess.vue';
import TotalCompanies from './Partials/totalCompanies.vue';

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
        header: 'Nama Akses',
        sortable: false
    },
    {
        field: 'name',
        header: 'Total Akses',
        sortable: false,
        component: shallowRef(TotalAccess)
    },
    {
        field: 'name',
        header: 'Total Akses Perusaahaan',
        sortable: false,
        component: shallowRef(TotalCompanies)
    },
])
const userRef = ref<{
    name: string,
    companies: string[]
    access: string[]
}>({
    name: '',
    companies: [],
    access: ['Dashboard'],
})

const store = useCompanyStore()


onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }
    getCompanyData()
})

const { validate, isValid, getError, scrolltoError } = useValidation(roleSchema, userRef, {
    mode: 'lazy',
});

const onAdd = () => {
    resetForm()
    modalRef.value = true;
}

const onEdit = (value: any) => {
    dataId.value = value.id
    userRef.value = {
        name: value.name,
        companies: value.companies.map((item: any) => item.companyId),
        access: value.access
    }

    modalRef.value = true;
}

const getCompanyData = async () => {
    await store.getData()
}


const resetForm = () => {
    userRef.value = {
        name: '',
        access: ['Dashboard'],
        companies: []
    }
    dataId.value = null
}

const handleSubmit = async () => {
    await validate()
    try {
        if (isValid.value) {
            await doRequest({
                url: dataId.value ? '/role/' + dataId.value : '/role',
                method: dataId.value ? 'PATCH' : 'POST',
                data: userRef.value
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

const confirmDeleteuser = (data: any) => {
    if (tableRef.value) {
        tableRef.value.confirmDeleteuser(data)
    }
}
</script>


<template>
    <div>
        <DataTableComponent get-url="role" @onAdd="onAdd" ref="tableRef" :columns="columns">
            <template #actionButton="slotProps">
                <div v-if="slotProps?.data?.name != 'Administrator'">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="onEdit(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger"
                        @click="confirmDeleteuser(slotProps.data)" />
                </div>
                <span v-else class="py-1 px-3 bg-red-200 text-red-700 rounded-2xl">{{ 'Tidak ada aksi' }}</span>
            </template>
        </DataTableComponent>

        <Dialog v-model:visible="modalRef" :style="{ width: '450px' }" header="Akses" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Nama" label="Nama Akses" v-model="userRef.name"
                    :invalid="!!getError('name')" :error-message="getError('name')" class-name="mb-2" />
            </div>
            <div class="flex flex-col gap-6">
                <CustomMultiSelectGroup :editable="true" label="Akses Perusahaan" :options="store.data"
                    :loading="store.loading" option-label="name" option-value="id"
                    :error-message="getError('companies')" name="companies" :invalid="!!getError('companies')"
                    v-model="userRef.companies" type="text" placeholder="Akses Perusahaan" class="w-full" />
            </div>

            <div class="flex flex-col gap-6 mt-8">
                <AccessItem v-model="userRef.access" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="() => modalRef = false" />
                <Button label="Simpan" icon="pi pi-check" @click="handleSubmit" />
            </template>
        </Dialog>
    </div>
</template>
