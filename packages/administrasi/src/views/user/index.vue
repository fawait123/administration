<script setup lang="ts">
import DataTableComponent, { type IColumnTable } from '@/composable/DataTableComponent.vue';
import useValidation from '@/helpers/validation.helper';
import { userEditSchema, userSchema } from '@/schema/index';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { onMounted, ref } from 'vue';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';
import CustomSelectGroup from '@/components/input/CustomSelectGroup.vue';
import CustomPasswordInputGroup from '@/components/input/CustomPasswordInputGroup.vue';

const modalRef = ref<boolean>(false)
const modalEditRef = ref<boolean>(false)
const dataId = ref<string | null>(null)
const roleData = ref<Record<string, any>[]>([])
const toast = useToast();
const tableRef = ref<InstanceType<typeof DataTableComponent> | null>(null)
const columns = ref<IColumnTable[]>([
    {
        field: 'id',
        header: 'ID',
        sortable: false
    },
    {
        field: 'username',
        header: 'Username',
        sortable: false
    },
    {
        field: 'email',
        header: 'Email',
        sortable: false
    }
])

onMounted(() => {
    if (tableRef.value) {
        tableRef.value.getData()
    }

    getRole()
})

const userRef = ref({
    username: '',
    email: '',
    password: '',
    roleId: ''
})

const { validate, isValid, getError, scrolltoError } = useValidation(userSchema, userRef, {
    mode: 'lazy',
});

const { validate: editValidate, isValid: editIsValid, getError: editError } = useValidation(userEditSchema, userRef, {
    mode: 'lazy',
});

const onAdd = () => {
    resetForm()
    modalRef.value = true;
}

const onEdit = (value: any) => {
    dataId.value = value.id
    userRef.value = {
        username: value.username,
        email: value.email,
        password: '',
        roleId: value.roleId
    }

    modalEditRef.value = true;
}


const resetForm = () => {
    userRef.value = {
        username: '',
        email: '',
        password: '',
        roleId: ''
    }
    dataId.value = null
}

const getRole = async () => {
    try {
        const response = await doRequest({
            url: '/role',
            method: 'get',
            params: {
                page: 1,
                limit: 10
            }
        })

        roleData.value = response.data.result
    } catch (error) {
        console.log(error)
    }
}

const handleSubmit = async () => {
    await validate()
    try {
        if (isValid.value) {
            await doRequest({
                url: '/user',
                method: 'POST',
                data: userRef.value
            })
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data berhasil ditambah', life: 3000 })
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

const handleEditSubmit = async () => {
    await editValidate()
    try {
        if (editIsValid.value) {
            await doRequest({
                url: '/user/' + dataId.value,
                method: 'PATCH',
                data: userRef.value
            })
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data berhasil diubah', life: 3000 })
            resetForm()

            if (tableRef.value) {
                tableRef.value.getData()
            }

            modalEditRef.value = false;
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
        <DataTableComponent get-url="user" @onAdd="onAdd" ref="tableRef" :columns="columns">
            <template #actionButton="slotProps">
                <div v-if="slotProps?.data?.username != 'administrator'">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="onEdit(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger"
                        @click="confirmDeleteuser(slotProps.data)" />
                </div>
                <span v-else class="py-1 px-3 bg-red-200 text-red-700 rounded-2xl">{{ 'Tidak ada aksi' }}</span>
            </template>
        </DataTableComponent>

        <Dialog v-model:visible="modalRef" :style="{ width: '450px' }" header="Pengguna" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Username" label="Username" v-model="userRef.username"
                    :invalid="!!getError('username')" :error-message="getError('username')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Email" label="email" v-model="userRef.email"
                    :invalid="!!getError('email')" :error-message="getError('email')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Password" label="password" v-model="userRef.password"
                    :invalid="!!getError('password')" :error-message="getError('password')" class-name="mb-1" />
                <CustomSelectGroup :editable="true" label="Pilih Akses" :options="roleData" option-label="name"
                    option-value="id" :error-message="getError('roleId')" :name="`roleId`"
                    :invalid="!!getError('roleId')" v-model="userRef.roleId" type="text" placeholder="Pilih Akses"
                    class="w-full" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="() => modalRef = false" />
                <Button label="Simpan" icon="pi pi-check" @click="handleSubmit" />
            </template>
        </Dialog>

        <Dialog v-model:visible="modalEditRef" :style="{ width: '450px' }" header="Pengguna" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Username" label="Username" v-model="userRef.username"
                    :invalid="!!editError('username')" :error-message="editError('username')" class-name="mb-1" />
                <CustomInputGroup placeholder="Masukan Email" label="email" v-model="userRef.email"
                    :invalid="!!editError('email')" :error-message="editError('email')" class-name="mb-1" />
                <CustomPasswordInputGroup placeholder="Masukan Password" label="Password" type="password"
                    v-model="userRef.password" :invalid="!!getError('password')" :error-message="getError('password')"
                    class-name="mb-8" />
                <CustomSelectGroup :editable="true" label="Pilih Akses" :options="roleData" option-label="name"
                    option-value="id" :error-message="editError('roleId')" :name="`roleId`"
                    :invalid="!!editError('roleId')" v-model="userRef.roleId" type="text" placeholder="Pilih Akses"
                    class="w-full" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="() => modalRef = false" />
                <Button label="Simpan" icon="pi pi-check" @click="handleEditSubmit" />
            </template>
        </Dialog>
    </div>
</template>
