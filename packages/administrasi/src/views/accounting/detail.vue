<script setup lang="ts">
import { onMounted, ref } from 'vue';
import doRequest from '@/helpers/do-request.helper';
import { useRoute } from 'vue-router';
import { formatRupiah } from '@/helpers';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import { useLoadingStore } from '@/store';
import LoadingComponent from '@/composable/LoadingComponent.vue';

const loading = useLoadingStore()
const accounting = ref<Record<string, any>>({})
const drawerAddAccount = ref<boolean>(false)
const route = useRoute()
const dataDetail = ref<{
    name: string,
    percentage: string,
    details: {
        note: string,
        amount: string
    }[]
}>({
    name: '',
    percentage: '0',
    details: []
})

onMounted(() => {
    getData()
})

const getData = async () => {
    loading.setLoading(true)
    try {
        const response = await doRequest({
            method: "get",
            url: "/accounting/" + route.params.id
        })

        accounting.value = response
        loading.setLoading(false)
    } catch (error) {
        loading.setLoading(false)
        console.log(error)
    }
}

const handleEdit = (data: Record<string, any>) => {
    dataDetail.value = {
        name: data.name,
        percentage: data.percentage,
        details: data.expenseDetails
    };
    drawerAddAccount.value = true;
}
</script>

<template>
    <div>
        <LoadingComponent v-if="loading.loading" />
        <div v-else>
            <div class="grid gap-4">
                <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div class="card flex flex-col gap-6">
                        <h1 class="font-bold text-[16px] text-slate-500">{{ accounting?.invoice?.number }}</h1>
                        <h1 class="font-bold text-[24px] text-slate-500">{{
                            formatRupiah(accounting?.AccountingDetail?.reduce((prev: any, next: any) => prev +
                                next.subTotal, 0)) }}</h1>
                    </div>
                </div>
                <div class="card">
                    <DataTable :value="accounting?.AccountingDetail" tableStyle="min-width: 50rem" class="mt-4"
                        :lazy="true">
                        <Column field="name" header="Nama Akun"></Column>
                        <Column header="Persentase">
                            <template #body="slotProps">
                                <span>{{ slotProps.data.percentage }} %</span>
                            </template>
                        </Column>
                        <Column header="Sub Total">
                            <template #body="slotProps">
                                <span>{{ formatRupiah(slotProps.data.subTotal) }}</span>
                            </template>
                        </Column>
                        <Column header="Pengurangan">
                            <template #body="slotProps">
                                <span>{{ formatRupiah(slotProps.data.expenses) }}</span>
                            </template>
                        </Column>
                        <Column header="Penghasilan">
                            <template #body="slotProps">
                                <span>{{ formatRupiah(slotProps.data.income) }}</span>
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
            <Drawer v-model:visible="drawerAddAccount" header="Detail Akun" position="right"
                class="min-w-[600px] max-w-[600px]">
                <div class="grid gap-4 mb-4">
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup :readonly="true" label="Nama Akun" type="string" placeholder="Nama Akun"
                            v-model="dataDetail.name" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup :readonly="true" label="Jumlah Persentase" v-model="dataDetail.percentage"
                            type="number" placeholder="Jumlah Persentase" class="w-full" />
                    </div>
                    <h1 class="font-bold" v-if="dataDetail.details.length > 0">Detail</h1>
                    <div class="border p-4 rounded-md" v-if="dataDetail.details.length > 0">
                        <div class="grid grid-cols-8 gap-2  mb-4" v-for="(detail, i) in dataDetail.details" :key="i">
                            <InputText :readonly="true" type="text" class="col-span-4" placeholder="Keterangan"
                                v-model="detail.note" />
                            <InputText :readonly="true" type="number" class="col-span-4" placeholder="Jumlah"
                                v-model="detail.amount" />
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    </div>
</template>
