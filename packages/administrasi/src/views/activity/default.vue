<script setup lang="ts">
import DataTableComponent from '@/composable/DataTableComponent.vue';
import useValidation from '@/helpers/validation.helper';
import { activitySchema } from '@/schema/index';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { onMounted, ref } from 'vue';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';
import CustomSelectGroup from '@/components/input/CustomSelectGroup.vue';
import type { IColumnTable } from "@/interfaces";

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
    {
        field: 'description',
        header: 'Deskripsi',
        sortable: false
    },
])

const activityRef = ref({
    name: '',
    type: 'DEFAULT',
    description: '',
    group: []
})

const activityData = ref<{
    label: string,
    value: string
}>([]);

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
        type: 'DEFAULT',
        description: value.description,
        group: value?.childrens?.map((item) => item.childId)
    }

    modalRef.value = true;
}

const getDataActivity = async () => {
    try {
        const response = await doRequest({
            url: '/activity',
            method: 'get',
            params: {
                all: true
            }
        });
        activityData.value = response.data.result?.map((item) => ({ label: item.name, value: item.id }))
    } catch (error) {
        console.log(error)
    }
}


const resetForm = () => {
    activityRef.value = {
        name: '',
        type: 'DEFAULT',
        description: '',
        group: []
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
                data: {
                    name: activityRef.value.name,
                    type: 'DEFAULT',
                    description: activityRef.value.description,
                    childrens: activityRef.value.group
                }
            })
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data berhasil ' + dataId.value ? 'diubah' : 'ditambah', life: 3000 })
            resetForm()

            if (tableRef.value) {
                tableRef.value.getData()
            }

            modalRef.value = false;
            getDataActivity()
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi kesahalan', detail: error?.message, life: 3000 })
    }
}

onMounted(() => {
    getDataActivity()
    if (tableRef.value) {
        tableRef.value.getData()
    }
})
</script>


<template>
    <div>
        <DataTableComponent get-url="activity" @onAdd="onAdd" @onEdit="onEdit" ref="tableRef" :columns="columns"
            :params="{ where: { type: 'DEFAULT' } }" />

        <Dialog v-model:visible="modalRef" :style="{ width: '450px' }" header="Pengguna Details" :modal="true">
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Aktifitas" label="Aktifitas" v-model="activityRef.name"
                    :invalid="!!getError('name')" :error-message="getError('name')" class-name="mb-8" />
            </div>
            <div class="flex flex-col gap-6">
                <CustomInputGroup placeholder="Masukan Deskripsi" label="Deskripsi" v-model="activityRef.description"
                    :invalid="!!getError('description')" :error-message="getError('description')" class-name="mb-8" />
            </div>

            <div class="flex flex-col gap-6">
                <CustomMultiSelectGroup :editable="true" label="Pilih Group" :options="activityData"
                    option-label="label" option-value="value" :error-message="getError('group')" name="group"
                    :invalid="!!getError('group')" v-model="activityRef.group" placeholder="Group" class="w-full" />
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="() => modalRef = false" />
                <Button label="Simpan" icon="pi pi-check" @click="handleSubmit" />
            </template>
        </Dialog>
    </div>
</template>
