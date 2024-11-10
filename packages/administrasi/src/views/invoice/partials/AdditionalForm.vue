<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import useValidation from '@/helpers/validation.helper'
import { invoiceAdditionalSchema } from '@/schema/index'
import { useToast } from "primevue/usetoast";
import { ResponseMessage } from "@/helpers";
import CustomInputGroup from "@/components/input/CustomInputGroup.vue";
import CustomSelectGroup from "@/components/input/CustomSelectGroup.vue";
import doRequest from "@/helpers/do-request.helper";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
    totalData: number
}>()

const router = useRouter()
const toast = useToast()
const employeeData = ref<any[]>([])
const activityData = ref<any[]>([])
const memberWorkResultData = ref<any[]>([])

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

const formRef = ref({
    number: null,
    invoiceAdditionals: [
        {
            activityId: '',
            bapNumber: '',
            amount: '0'
        }
    ]
})


const { validate, isValid, getErros, getError, scrolltoError } = useValidation(invoiceAdditionalSchema, formRef, {
    mode: 'lazy',
});

const addBon = () => {
    formRef.value.invoiceAdditionals.push({
        activityId: '',
        bapNumber: '',
        amount: '0'
    })
}

const removeBon = (index: number) => {
    formRef.value.invoiceAdditionals.splice(index, 1)
}

const handlePlusMinusBon = (index: number) => {
    if (index == 0) {
        addBon()
    } else {
        removeBon(index)
    }
}

const generateDataBon = () => {
    for (let index = 0; index < props.totalData; index++) {
        addBon()
    }
}

const handleSubmit = async () => {
    try {
        await validate()
        if (isValid.value) {
            await doRequest({
                url: "/invoice/additional",
                method: "post",
                data: {
                    number: formRef.value.number,
                    invoiceAdditionals: formRef.value.invoiceAdditionals.filter((el) => el.bapNumber != "").map((item) => {
                        return {
                            bapNumber: item.bapNumber,
                            amount: +item.amount,
                            activityId: item.activityId
                        }
                    })
                }
            })
            toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data Invoice Berhasil ditambah' })
            router.push({ name: 'invoice' })
            console.log('success')
        } else {
            scrolltoError('.text-red-500')
        }
    } catch (error: any) {
        console.log(error.message)
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error) })
    }
}


defineExpose({ generateDataBon })
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
            <h6 class="font-semibold text-xl mb-2">INVOICE TAMBAHAN</h6>
            <div class="card relative" v-for="(bon, i) in formRef.invoiceAdditionals" :key="i">
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup label="Nomor BAP"
                            :error-message="getErros('invoiceAdditionals', 'bapNumber', i)" :name="`bapNumber[${[i]}]`"
                            :invalid="!!getErros('invoiceAdditionals', 'bapNumber', i)" v-model="bon.bapNumber"
                            type="text" placeholder="Nomor BAP" class="w-full" />
                        <CustomInputGroup label="Amount" :error-message="getErros('invoiceAdditionals', 'amount', i)"
                            :name="`amount[${[i]}]`" :invalid="!!getErros('invoiceAdditionals', 'amount', i)"
                            v-model="bon.amount" type="number" placeholder="Amount" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-8">

                        <CustomSelectGroup :editable="true" label="Pilih Aktifitas" :options="activityData"
                            option-label="name" option-value="id"
                            :error-message="getErros('invoiceAdditionals', 'activityId', i)" :name="`activity[${[i]}]`"
                            :invalid="!!getErros('invoiceAdditionals', 'activityId', i)" v-model="bon.activityId"
                            type="text" placeholder="Kegiatan" class="w-full" />
                    </div>
                </div>
                <div class="w-10 h-10 rounded-full bg-primary text-white flex justify-center items-center absolute top-[-10px] right-[-5px] cursor-pointer"
                    @click="handlePlusMinusBon(i)" :class="i == 0 ? 'bg-primary' : 'bg-red-500'">
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
    </div>
</template>
