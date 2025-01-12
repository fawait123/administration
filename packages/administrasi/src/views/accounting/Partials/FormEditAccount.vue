<script setup lang="ts">
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { formatRupiah } from '@/helpers';
import { computed, onMounted, ref } from 'vue';
import useValidation from '@/helpers/validation.helper';
import { accountingSchema } from '@/schema';
import doRequest from '@/helpers/do-request.helper';
import CustomMultiSelectGroup from '@/components/input/CustomMultiSelectGroup.vue';
import { useToast } from 'primevue';
import { useRoute, useRouter } from 'vue-router';

const toast = useToast()
const route = useRouter()
const router = useRoute()

const invoiceOptions = ref<{
    id: string,
    name: string,
    total: number
}[]>([])
const formRef = ref<{
    invoice: string[],
    accountName: string,
    percentage: string,
    additionals: {
        note: string,
        amount: string
    }[]
}>({
    invoice: [],
    accountName: '',
    percentage: '',
    additionals: [
        {
            note: '',
            amount: ''
        }
    ]
})

const getInvoice = async () => {
    const response = await doRequest({
        url: 'invoice/all/v2',
        method: 'GET',
    })

    invoiceOptions.value = response.data.map((item: { id: string, number: string, total: string, type: string, name: string }) => {
        return {
            id: item.id,
            name: `${item.number} (${item.name}) (${item.type})`,
            total: Number(item.total)
        }
    })
}

const getDetail = async () => {
    try {
        const response = await doRequest({
            method: 'GET',
            url: 'accounting/' + router.params.id
        })

        const data = response.data
        formRef.value = {
            accountName: data.accountName,
            percentage: String(data.percentage),
            additionals: data.additionals,
            invoice: data.profitLooseInvoices.map((item: { invoiceId: string }) => item.invoiceId)
        }
    } catch (error) {
        console.log(error)
    }
}

const { validate, isValid, getErros, getError, scrolltoError } = useValidation(accountingSchema, formRef, {
    mode: 'lazy'
});


const handleSubmit = async () => {
    await validate();
    if (isValid.value) {
        try {
            await doRequest({
                url: 'accounting/' + router.params.id,
                method: 'PATCH',
                data: {
                    accountName: formRef.value.accountName,
                    percentage: Number(formRef.value.percentage),
                    additionals: formRef.value.additionals.filter((value) => value.note != ''),
                    profitAndLossInvoice: formRef.value.invoice,
                    total: total.value,
                    profit: profit.value
                }
            })

            toast.add({ severity: 'success', summary: 'Opps!', detail: 'Data laba rugi berhasil diubah', life: 3000 })
            route.push({ name: 'accounting' })
        } catch (error: any) {
            toast.add({ severity: 'error', summary: 'Opps!', detail: error.message, life: 3000 })
        }
    }
}

const handlePlusMinus = (i: number) => {
    if (i == 0) {
        formRef.value.additionals.push({
            note: '',
            amount: ''
        })
    } else {
        formRef.value.additionals.splice(i, 1)
    }
}


const total = computed(() => {
    const findData = invoiceOptions.value.filter((value) => formRef.value.invoice.some(invoice => invoice == value.id))
    return findData.reduce((prev, next) => prev + next.total, 0)
})

const profit = computed(() => {
    if (formRef.value.percentage != "" && total.value != 0) {
        return Number(formRef.value.percentage) / 100 * total.value;
    }

    return 0;
})


onMounted(() => {
    getInvoice()
    getDetail()
})



</script>

<template>
    <div class="grid gap-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomMultiSelectGroup :editable="true" :invalid="!!getError('invoice')"
                :errorMessage="getError('invoice')" label="Pilih Invoice" :options="invoiceOptions" option-label="name"
                option-value="id" type="text" placeholder="Invoice" class="w-full" v-model="formRef.invoice" />
            <div class="grid grid-cols-2 gap-3">
                <div class="grid gap-3">
                    <h1 class="font-bold text-2xl">Total</h1>
                    <h1 class="font-bold text-muted-color text-3xl">{{ formatRupiah(total) }}</h1>
                </div>
                <div class="grid gap-3">
                    <h1 class="font-bold text-2xl">Pendapatan</h1>
                    <h1 class="font-bold text-muted-color text-3xl">{{ formatRupiah(profit) }}</h1>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInputGroup label="Nama Akun" :errorMessage="getError('accountName')"
                :invalid="!!getError('accountName')" type="text" placeholder="Nama Akun"
                v-model="formRef.accountName" />
            <CustomInputGroup label="Persentase" :errorMessage="getError('percentage')"
                :invalid="!!getError('percentage')" type="number" placeholder="Persentase"
                v-model="formRef.percentage" />
        </div>
        <h1 class="font-bold text-3xl text-muted-color">Tambahan</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative mb-5" v-for="(form, i) in formRef.additionals"
            :key="i">
            <CustomInputGroup label="Catatan" type="text" placeholder="Catatan" v-model="form.note"
                :errorMessage="getErros('additionals', 'note', i)" :invalid="!!getErros('additionals', 'note', i)" />
            <CustomInputGroup label="Jumlah" type="number" placeholder="Jumlah" v-model="form.amount"
                :errorMessage="getErros('additionals', 'amount', i)"
                :invalid="!!getErros('additionals', 'amount', i)" />
            <div class="w-10 h-10 rounded-full bg-primary text-white flex justify-center items-center absolute top-[-25px] right-[-5px] cursor-pointer"
                @click="handlePlusMinus(i)" :class="i == 0 ? 'bg-primary' : 'bg-red-500'">
                <span :class="i == 0 ? 'pi pi-plus' : 'pi pi-minus'"></span>
            </div>
        </div>
        <div>
            <Button @click="handleSubmit">Simpan</Button>
        </div>
    </div>
</template>
