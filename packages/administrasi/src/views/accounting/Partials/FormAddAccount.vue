<script setup lang="ts">
import CustomSelectGroup from '@/components/input/CustomSelectGroup.vue';
import { formatRupiah } from '@/helpers';
import { computed, ref } from 'vue';
import useValidation from '@/helpers/validation.helper';
import { accountingSchema, addAccountSchema } from '@/schema';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import doRequest from '@/helpers/do-request.helper';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const invoiceNumber = computed(() => {
    return invoiceData.value.find((el: any) => el.id == invoiceRef.value.invoiceId)?.number || '-';
});
const totalPercentage = computed(() => {
    const percentage = detailAccounts.value.reduce((prev, next) => prev + next.percentage, 0);
    return percentage;
});
const total = computed(() => {
    return invoiceData.value.filter((el: any) => el.id == invoiceRef.value.invoiceId).reduce((prev, next: any) => prev + next.total, 0);
});
const totalUsed = computed(() => {
    // Menghitung total persentase dari detailAccounts
    const percentage = detailAccounts.value.reduce((prev, next) => prev + next.percentage, 0);
    // Menghitung persentase dari nilai total di invoiceRef
    return (percentage * total.value) / 100;
});
const invoiceData = ref<Record<string, any>[]>([]);
const invoiceRef = ref({
    invoiceId: ''
});
const loadingSelect = ref<boolean>(false);
const drawerAddAccount = ref<boolean>(false);
const detailAccounts = ref<
    {
        name: string;
        percentage: number;
        details: {
            note: string;
            amount: string;
        }[];
    }[]
>([]);
const accountRef = ref<{
    name: string;
    percentage: string;
    details: {
        note: string;
        amount: string;
    }[];
}>({
    name: '',
    percentage: (100 - totalPercentage.value).toString(),
    details: []
});
const details = ref<
    {
        note: string;
        amount: string;
    }[]
>([
    {
        note: '',
        amount: '0'
    }
]);

const { validate, isValid, getErros, getError, scrolltoError } = useValidation(addAccountSchema, accountRef, {
    mode: 'lazy'
});

const {
    validate: accountingValidate,
    isValid: accountingIsValid,
    getErros: accountGetErrors,
    getError: accountingGetError,
    scrolltoError: accountingScrolltoError
} = useValidation(accountingSchema, invoiceRef, {
    mode: 'lazy'
});

const resetFormAccount = () => {
    accountRef.value = {
        name: '',
        percentage: (100 - totalPercentage.value).toString(),
        details: []
    };
};

const handleEdit = (data: any) => {
    console.log(data);
};

const addDetail = () => {
    details.value.push({
        note: '',
        amount: '0'
    });
};

const removeDetail = (i: number) => {
    details.value.splice(i, 1);
};

const openDrawer = () => {
    resetFormAccount();
    details.value = [
        {
            note: '',
            amount: '0'
        }
    ];
    drawerAddAccount.value = true;
};

const handleClick = async () => {
    try {
        await validate();
        if (isValid.value) {
            detailAccounts.value.push({
                name: accountRef.value.name,
                percentage: +accountRef.value.percentage,
                details: details.value.filter((el) => el.note != '').length > 0 ? details.value : []
            });
            resetFormAccount();
            drawerAddAccount.value = false;
        }
    } catch (error) {
        console.log('err', error);
    }
};

const onShow = async () => {
    loadingSelect.value = true;
    try {
        const response = await doRequest({
            url: 'invoice/all',
            method: 'get'
        });
        invoiceData.value = response.data;
        loadingSelect.value = false;
    } catch (error) {
        loadingSelect.value = false;
        console.log(error);
    }
};

const handleSubmit = async () => {
    try {
        await accountingValidate();
        if (accountingIsValid.value) {
            await doRequest({
                url: 'accounting',
                method: 'POST',
                data: {
                    invoiceId: invoiceRef.value.invoiceId,
                    details: detailAccounts.value.map((item) => {
                        return {
                            name: item.name,
                            percentage: item.percentage,
                            subTotal: (item.percentage * total.value) / 100,
                            expenses: item.details.reduce((prev: any, next: any) => prev + +next.amount, 0),
                            income: (item.percentage * total.value) / 100 - item.details.reduce((prev: any, next: any) => prev + +next.amount, 0),
                            expenseDetails: item.details
                        };
                    })
                }
            });

            toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil ditambah', life: 3000 });
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Opps!', detail: error.message, life: 3000 });
    }
};
</script>

<template>
    <div>
        <div class="grid gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="card">
                    <CustomSelectGroup
                        @onShow="onShow"
                        :loading="loadingSelect"
                        :editable="true"
                        label="Pilih Invoice"
                        option-value="id"
                        v-model="invoiceRef.invoiceId"
                        :options="invoiceData"
                        optionLabel="number"
                        :invalid="false"
                        :error-message="``"
                        placeholder="Pilih Invoice"
                        class="w-full"
                    />
                </div>
                <div class="card flex flex-col gap-6">
                    <h1 class="font-bold text-[16px] text-slate-500">{{ invoiceNumber }}</h1>
                    <h1 class="font-bold text-[24px] text-slate-500">{{ formatRupiah(total) }} / {{ formatRupiah(totalUsed) }}</h1>
                </div>
            </div>
            <div class="card">
                <div class="flex gap-3">
                    <Button :disabled="invoiceRef.invoiceId == ''" size="small" @click="openDrawer">Tambah</Button>
                    <Button :disabled="detailAccounts.length == 0" size="small" @click="handleSubmit">Simpan</Button>
                </div>
                <DataTable :value="detailAccounts" tableStyle="min-width: 50rem" class="mt-4">
                    <Column field="name" header="Nama Akun"></Column>
                    <Column field="percentage" header="Persentase"></Column>
                    <Column header="Sub Total">
                        <template #body="slotProps">
                            <span class="font-bold">{{ formatRupiah((slotProps.data.percentage * total) / 100) }}</span>
                        </template>
                    </Column>
                    <Column header="Pengurangan">
                        <template #body="slotProps">
                            <span class="font-bold">{{ formatRupiah(slotProps.data.details.reduce((prev: any, next: any) => prev + +next.amount, 0)) }}</span>
                        </template>
                    </Column>
                    <Column header="Pendapatan Bersih">
                        <template #body="slotProps">
                            <span class="font-bold">{{ formatRupiah((slotProps.data.percentage * total) / 100 - slotProps.data.details.reduce((prev: any, next: any) => prev + +next.amount, 0)) }}</span>
                        </template>
                    </Column>
                    <Column header="#">
                        <template #body="slotProps">
                            <Button size="small" @click="handleEdit(slotProps.data)">
                                <i class="pi pi-eye"></i>
                            </Button>
                        </template>
                    </Column>
                    <template #empty>
                        <h1 class="font-bold">TIDAK ADA DATA</h1>
                    </template>
                </DataTable>
            </div>
        </div>
        <Drawer v-model:visible="drawerAddAccount" header="Tambah Akun" position="right" class="min-w-[600px] max-w-[600px]">
            <div class="grid gap-4 mb-4">
                <div class="flex flex-col gap-8">
                    <CustomInputGroup label="Nama Akun" :error-message="getError('name')" :invalid="!!getError('name')" v-model="accountRef.name" type="string" placeholder="Nama Akun" class="w-full" />
                </div>
                <div class="flex flex-col gap-8">
                    <CustomInputGroup label="Jumlah Persentase" :error-message="getError('percentage')" :invalid="!!getError('percentage')" v-model="accountRef.percentage" type="number" placeholder="Jumlah Persentase" class="w-full" />
                </div>
                <h1 class="font-bold">Detail</h1>
                <div class="border p-4 rounded-md">
                    <div class="grid grid-cols-9 gap-2 mb-4" v-for="(detail, i) in details" :key="i">
                        <InputText type="text" class="col-span-4" placeholder="Keterangan" v-model="detail.note" />
                        <InputText type="number" class="col-span-4" placeholder="Jumlah" v-model="detail.amount" />
                        <Button class="col-span-1" v-if="i == 0" @click="addDetail">
                            <i class="pi pi-plus"></i>
                        </Button>
                        <Button class="col-span-1" severity="danger" v-else @click="removeDetail(i)">
                            <i class="pi pi-minus"></i>
                        </Button>
                    </div>
                </div>
            </div>
            <Button size="small" @click="handleClick">Simpan</Button>
        </Drawer>
    </div>
</template>
