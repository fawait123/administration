<script setup lang="ts">
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import CustomTextareaGroup from '@/components/input/CustomTextareaGroup.vue';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import useValidation from '@/helpers/validation.helper';
import { settingCompanySchema } from '@/schema';

const companyRef = ref<{
    name: string,
    email: string,
    phone: string,
    address: string,
    directure: string,
    bankName: string,
    bankBranch: string,
    bankRekening: string,
    bankOwner: string
}>({
    name: '',
    address: '',
    email: '',
    phone: '',
    directure: '',
    bankName: '',
    bankBranch: '',
    bankOwner: '',
    bankRekening: ''
})
const loadingButton = ref<boolean>(false)

const toast = useToast()
const { validate, isValid, getError, scrolltoError } = useValidation(settingCompanySchema, companyRef, {
    mode: 'lazy',
});

const getData = async () => {
    try {
        const response = await doRequest({
            url: "/setting/company",
            method: "get"
        })

        companyRef.value = {
            name: response.data?.name,
            email: response.data?.email,
            phone: response.data?.phone,
            address: response.data?.address,
            directure: response.data?.directure,
            bankBranch: response.data?.bankBranch,
            bankName: response.data?.bankName,
            bankOwner: response.data?.bankOwner,
            bankRekening: response.data?.bankRekening
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
                url: "/setting/company",
                method: "post",
                data: companyRef.value
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
            <h2 class="font-bold text-[24px]">Setting Perusahaan</h2>
            <div>
                <h1 class="font-bold text-[16px] my-8 text-slate-400">Informasi Perusahaan</h1>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Masukan Nama Perusahaan" label="Nama Perusahaan" class-name="mb-8"
                        v-model="companyRef.name" />
                </div>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Direktur" label="Direktur" class-name="mb-8"
                        v-model="companyRef.directure" />
                </div>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Masukan Email" label="Email" class-name="mb-8"
                        v-model="companyRef.email" />
                </div>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Masukan Telepon" label="Telepon" class-name="mb-8"
                        v-model="companyRef.phone" />
                </div>
                <div class="flex flex-col gap-6">
                    <CustomTextareaGroup placeholder="Masukan Alamat" label="Alamat" class-name="mb-8"
                        v-model="companyRef.address" />
                </div>
                <h1 class="font-bold text-[16px] my-8 text-slate-400">Informasi Bank</h1>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Nama Bank" label="Nama Bank" class-name="mb-8"
                        v-model="companyRef.bankName" />
                </div>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Cabang Bank" label="Cabang Bank" class-name="mb-8"
                        v-model="companyRef.bankBranch" />
                </div>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Nomor Rekening" label="Nomor Rekening" class-name="mb-8"
                        v-model="companyRef.bankRekening" />
                </div>
                <div class="flex flex-col gap-6">
                    <CustomInputGroup placeholder="Pemilik Rekening" label="Pemilik Rekening" class-name="mb-8"
                        v-model="companyRef.bankOwner" />
                </div>
                <Button @click="handleSubmit" :loading="loadingButton">Simpan</Button>
            </div>
        </div>
    </div>
</template>
