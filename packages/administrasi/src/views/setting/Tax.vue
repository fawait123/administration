<script setup lang="ts">
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import useValidation from '@/helpers/validation.helper';
import { settingCompanySchema, settingTaxSchema } from '@/schema';

const companyRef = ref<{
    tax: string,
}>({
    tax: '',
})
const loadingButton = ref<boolean>(false)

const toast = useToast()
const { validate, isValid, getError, scrolltoError } = useValidation(settingTaxSchema, companyRef, {
    mode: 'lazy',
});

const getData = async () => {
    try {
        const response = await doRequest({
            url: "/setting/tax",
            method: "get"
        })

        companyRef.value = {
            tax: response.data?.amount,
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: "Terjadi Kesahalan", detail: error.message, life: 3000 })
    }
}

const handleSubmit = async () => {
    loadingButton.value = true
    await validate()
    try {
        if (isValid.value) {
            await doRequest({
                url: "/setting/tax",
                method: "post",
                data: {
                    amount: companyRef.value.tax
                }
            })

            toast.add({ severity: 'success', summary: "Terjadi Kesahalan", detail: 'Berhasil mengubah setting perusahaan', life: 3000 })
            loadingButton.value = false
            getData()
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: "Terjadi Kesahalan", detail: error.message, life: 3000 })
        loadingButton.value = false
    }
}

onMounted(() => {
    getData()
})

</script>

<template>
    <div class="flex justify-center">
        <div class="card w-full md:min-w-[50%] md:max-w-[50%] flex flex-col gap-8">
            <h2 class="font-bold text-[24px]">Setting Pajak</h2>
            <div>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Masukan Pajak" label="Jumlah Pajak" class-name="mb-8"
                        v-model="companyRef.tax" />
                </div>
                <Button @click="handleSubmit" :loading="loadingButton">Simpan</Button>
            </div>
        </div>
    </div>
</template>
