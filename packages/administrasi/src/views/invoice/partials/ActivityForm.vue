<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import useValidation from '@/helpers/validation.helper'
import { invoiceSchema } from '@/schema/index'
import { useToast } from "primevue/usetoast";
import { ResponseMessage } from "@/helpers";
import CustomInputGroup from "@/components/input/CustomInputGroup.vue";
import CustomSelectGroup from "@/components/input/CustomSelectGroup.vue";
import doRequest from "@/helpers/do-request.helper";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import CustomMultiSelectGroup from "@/components/input/CustomMultiSelectGroup.vue";

const props = defineProps<{
    totalData: number,
    edit: boolean
}>()

const emmit = defineEmits()

const router = useRouter()
const route = useRoute()
const toast = useToast()
const employeeData = ref<any[]>([])
const activityData = ref<any[]>([])
const memberWorkResultData = ref<any[]>([])
const selectedMemberWorkData = ref<Record<string, any>>({})
const selectedOptions = ref<{
    index: number,
    id: string
}[]>([])
const dataTobeDeleted = ref<Record<string, any> | null>(null)
const deleteModal = ref<boolean>(false)

const getEmployee = async () => {
    const employeeRequest = await doRequest({
        url: 'employee',
        method: "get",
        params: {
            page: 1, // Calculate page number
            limit: 100,
        }
    })

    const data = employeeRequest.data.result
    employeeData.value = data
}

const getActivity = async () => {
    const employeeRequest = await doRequest({
        url: 'activity',
        method: "get",
        params: {
            page: 1, // Calculate page number
            limit: 100,
            where: {
                type: 'COMPANY'
            }
        },
    })

    const data = employeeRequest.data.result
    activityData.value = data
}

const getMemberWorkResult = async () => {
    const employeeRequest = await doRequest({
        url: 'member-work-result/activities',
        method: "get",
        params: {
            page: 1, // Calculate page number
            limit: 100,
        },
    })

    const data = employeeRequest.data
    memberWorkResultData.value = data.map((item: any) => {
        return {
            label: (item?.memberWorkResult?.employee?.name + ' ' + item.plot + ' ' + item?.activity?.name) || "",
            value: item.id,
            wide: item.wide,

        }
    })
}

onMounted(() => {
    getEmployee()
    getActivity()
    getMemberWorkResult()
})

const formRef = ref<{
    number: string | null,
    invoiceActivites: {
        bapNumber: string,
        zone: string,
        activityId: string,
        wide: string,
        price: string,
        total: string,
        details: [],
        id: string | null
    }[]
}>({
    number: null,
    invoiceActivites: [
        {
            bapNumber: '',
            zone: '',
            activityId: '',
            wide: '0',
            price: '0',
            total: '0',
            details: [],
            id: null
        }
    ]
})


const { validate, isValid, getErros, getError, scrolltoError } = useValidation(invoiceSchema, formRef, {
    mode: 'lazy',
});

const addActivity = () => {
    formRef.value.invoiceActivites.push({
        bapNumber: '',
        zone: '',
        activityId: '',
        wide: '0',
        price: '0',
        total: '0',
        details: [],
        id: null
    })
}

const removeActivity = (index: number) => {
    formRef.value.invoiceActivites.splice(index, 1)
}

const handlePlusMinusActivity = (index: number, activity: Record<string, any>) => {
    if (index == 0) {
        addActivity()
    } else {
        if (props.edit && activity.id != null) {
            deleteModal.value = true
            dataTobeDeleted.value = activity
        } else {
            removeActivity(index)
        }
    }
}

const generateDataActivity = () => {
    console.log('dipanggil')
    for (let index = 0; index < props.totalData; index++) {
        addActivity()
    }
}
const handleSubmit = async () => {
    try {
        await validate()
        if (isValid.value) {
            await doRequest({
                url: props.edit == true ? "/invoice/" + route.params.id : "/invoice",
                method: props.edit == true ? "patch" : "post",
                data: {
                    number: formRef.value.number,
                    invoiceActivites: formRef.value.invoiceActivites.map((item) => {
                        return {
                            bapNumber: item.bapNumber,
                            zone: item.zone,
                            wide: +item.wide,
                            price: +item.price,
                            total: +item.total,
                            activityId: item.activityId,
                            details: item.details.map((det) => {
                                return {
                                    memberWorkResultId: det
                                }
                            }),
                            id: item.id
                        }
                    })
                }
            })
            toast.add({ severity: 'success', summary: 'Berhasil', detail: `Data invoice berhasil ${props.edit ? 'diubah' : 'ditambah'}`, life: 3000 })
            router.push({ name: 'invoice' })
            console.log('success')
        } else {
            scrolltoError('.text-red-500')
        }
    } catch (error: any) {
        console.log(error.message)
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error), life: 3000 })
    }
}


const calculateprice = (event: any, i: number) => {
    formRef.value.invoiceActivites[i].total = (event * +formRef.value.invoiceActivites[i].wide).toString()
}


const calculateWide = (event: any, i: number) => {
    formRef.value.invoiceActivites[i].total = (event * +formRef.value.invoiceActivites[i].price).toString()
}

const handleChangeMemberWork = (value: string[], i: number) => {
    const filter = memberWorkResultData.value.filter((el) => value.includes(el.value))
    formRef.value.invoiceActivites[i].wide = `${filter.reduce((prev, next) => prev + next.wide, 0)}`
    selectedMemberWorkData.value = {
        ...selectedMemberWorkData.value,
        [i]: filter
    }
    console.log(selectedMemberWorkData.value)
}

const availableOptions = (i: number) => {
    const filtered = activityData.value.filter((item) => !selectedOptions.value.filter((el) => el.index != i).some((el) => el.id == item.id))
    console.log(filtered)
    return filtered
}

const handleSelectOption = (i: number, data: any) => {
    selectedOptions.value.push({
        id: data,
        index: i
    })
}

const handleDelete = async () => {
    emmit('deleteActivity')
}

defineExpose({ generateDataActivity, formRef, selectedOptions, dataTobeDeleted, deleteModal })
</script>

<template>
    <div class="flex justify-center items-center">
        <div class="w-full">
            <div class="card">
                <span>Tekan <span class="font-bold text-primary">Ctl + K</span> untuk membuat lebih banyak</span>
            </div>
            <div class="card">
                <div class="grid grid-cols-1">
                    <CustomInputGroup type="text" placeholder="Masukan Nomor Invoice" label="Nomor Invoice"
                        v-model="formRef.number" :invalid="!!getError('number')" :error-message="getError('number')"
                        class-name="mb-8" />

                </div>
            </div>
            <h6 class="font-semibold text-xl mb-2">INVOICE KEGIATAN</h6>
            <div class="card relative" v-for="(activity, i) in formRef.invoiceActivites" :key="i">
                <div class="grid grid-cols-3 gap-4">
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup label="Nomor BAP" :invalid="!!getErros('invoiceActivites', 'bapNumber', i)"
                            :name="`plot[${[i]}]`" :error-message="getErros('invoiceActivites', 'bapNumber', i)"
                            v-model="activity.bapNumber" type="text" placeholder="Nomor BAP" class="w-full" />
                        <CustomSelectGroup @valueChange="(value: any) => handleSelectOption(i, value)" :editable="true"
                            label="Pilih Aktifitas" :options="availableOptions(i)" option-label="name" option-value="id"
                            :error-message="getErros('invoiceActivites', 'activityId', i)" :name="`activity[${[i]}]`"
                            :invalid="!!getErros('invoiceActivites', 'activityId', i)" v-model="activity.activityId"
                            type="text" placeholder="Kegiatan" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup label="Zona" :error-message="getErros('invoiceActivites', 'zone', i)"
                            :name="`zone[${[i]}]`" :invalid="!!getErros('invoiceActivites', 'zone', i)"
                            v-model="activity.zone" type="text" placeholder="zone" class="w-full" />

                        <CustomInputGroup label="Luas" :error-message="getErros('invoiceActivites', 'wide', i)"
                            @input="calculateWide(activity.wide, i)" :name="`wide[${[i]}]`"
                            :invalid="!!getErros('invoiceActivites', 'wide', i)" v-model="activity.wide" type="number"
                            placeholder="Luas" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-8">
                        <CustomMultiSelectGroup :editable="true" label="Pilih Hasil kerja Anggota"
                            @handleChange="handleChangeMemberWork(activity.details, i)" :options="memberWorkResultData"
                            option-label="label" option-value="value"
                            :error-message="getErros('invoiceActivites', 'details', i)" :name="`activity[${[i]}]`"
                            :invalid="!!getErros('invoiceActivites', 'details', i)" v-model="activity.details"
                            type="text" placeholder="Hasil Kerja Anggota" class="w-full" />
                        <CustomInputGroup label="Harga" :error-message="getErros('invoiceActivites', 'price', i)"
                            @input="calculateprice(activity.price, i)" :name="`price[${[i]}]`"
                            :invalid="!!getErros('invoiceActivites', 'price', i)" v-model="activity.price" type="number"
                            placeholder="Harga" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup label="Jumlah" :error-message="getErros('invoiceActivites', 'total', i)"
                            :readonly="true" :name="`total[${[i]}]`"
                            :invalid="!!getErros('invoiceActivites', 'total', i)" v-model="activity.total" type="text"
                            placeholder="Total" class="w-full" />
                    </div>
                </div>
                <div class="w-10 h-10 rounded-full text-white flex justify-center items-center absolute top-[-10px] right-[-5px] cursor-pointer"
                    @click="handlePlusMinusActivity(i, activity)" :class="i == 0 ? 'bg-primary' : 'bg-red-500'">
                    <span :class="i == 0 ? 'pi pi-plus' : 'pi pi-minus'"></span>
                </div>
            </div>
            <div class="flex justify-end">
                <div class="flex gap-4">
                    <Button label="KEMBALI" outlined />
                    <Button label="SIMPAN" type="button" @click="handleSubmit" />
                </div>
            </div>
        </div>
        <Dialog v-model:visible="deleteModal" :style="{ width: '450px' }" header="Hapus data ?" :modal="true">
            <span>Apakah kamu yakin ingin menghapus data <span class="font-bold">(Data di dalam database akan ikut
                    terhapus)</span>?</span>

            <template #footer>
                <Button label="Yes" icon="pi pi-check" text @click="handleDelete" />
            </template>
        </Dialog>
    </div>
</template>
