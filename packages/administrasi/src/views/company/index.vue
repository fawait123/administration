<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import useValidation from '@/helpers/validation.helper';
import { companySchema } from '@/schema/index';
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
        header: 'Nama Perusahaan',
        sortable: false
    },

    {
        field: 'address',
        header: 'Alamat',
        sortable: false
    },

    {
        field: 'email',
        header: 'Email',
        sortable: false
    },

    {
        field: 'phone',
        header: 'No Telepon',
        sortable: false
    },
])

onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }
})

const companyRef = ref({
    name: '',
    address: '',
    email: '',
    phone: ''
})

const { validate, isValid, getError, scrolltoError } = useValidation(companySchema, companyRef, {
    mode: 'lazy',
});

const onAdd = () => {
    resetForm()
    modalRef.value = true;
}

const onEdit = (value: any) => {
    dataId.value = value.id
    companyRef.value = {
        name: value.name,
        address: value.address,
        email: value.email,
        phone: value.phone
    }

    modalRef.value = true;
}


const resetForm = () => {
    companyRef.value = {
        name: '',
        address: '',
        email: '',
        phone: ''
    }
    dataId.value = null
}

const handleSubmit = async () => {
    await validate()
    try {
        if (isValid.value) {
            await doRequest({
                url: dataId.value ? '/company/' + dataId.value : '/company',
                method: dataId.value ? 'PATCH' : 'POST',
                data: companyRef.value
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
        <DataTableComponent get-url="company" @onAdd="onAdd" @onEdit="onEdit" ref="tableRef" :columns="columns" />

        <Dialog v-model:visible="modalRef" :style="{ width: '450px' }" header="Pengguna Details" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Perusahaan" label="Perusahaan" v-model="companyRef.name"
                    :invalid="!!getError('name')" :error-message="getError('name')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Alamat" label="Alamat" v-model="companyRef.address"
                    :invalid="!!getError('address')" :error-message="getError('address')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Email" label="Email" v-model="companyRef.email"
                    :invalid="!!getError('email')" :error-message="getError('email')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Telepon" label="Telepon" v-model="companyRef.phone"
                    :invalid="!!getError('phone')" :error-message="getError('phone')" class-name="mb-1" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="() => modalRef = false" />
                <Button label="Simpan" icon="pi pi-check" @click="handleSubmit" />
            </template>
        </Dialog>
    </div>
</template>
