<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import doRequest from '@/helpers/do-request.helper';
import { useRoute } from 'vue-router';
import { formatRupiah } from '@/helpers';
import { useLoadingStore } from '@/store';
import LoadingComponent from '@/composable/LoadingComponent.vue';

const loading = useLoadingStore()
const accounting = ref<{
    id: string,
    accountName: string,
    percentage: number,
    additionals: {
        note: string,
        amount: number
    }[],
    total: number,
    profit: number,
    createdAt: string,
    updatedAt: string,
    profitLooseInvoices: {
        invoice: {
            number: string
        }
    }[]
} | undefined>()
const route = useRoute()

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

        accounting.value = response.data as any
        loading.setLoading(false)
    } catch (error) {
        loading.setLoading(false)
        console.log(error)
    }
}

const minus = computed(() => {
    return accounting.value?.additionals.reduce((prev, next) => prev + Number(next.amount), 0)
})
</script>

<template>
    <div>
        <LoadingComponent v-if="loading.loading" />
        <div v-else>
            <div class="grid gap-4">
                <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div class="card grid grid-cols-2 gap-6">
                        <div class="grid gap-3">
                            <h1 class="font-bold text-[16px] text-slate-500">{{ accounting?.accountName }}</h1>
                            <h1 class="font-bold text-3xl text-slate-500">{{ formatRupiah(accounting?.profit as
                                number)
                                }}<span class="ml-3 text-[10px] align-super">/ {{ formatRupiah(accounting?.total as
                                    number)
                                    }}</span>
                            </h1>
                        </div>

                        <div class="grid gap-3">
                            <h1 class="font-bold text-[16px] text-slate-500">Pendapatan Bersih</h1>
                            <h1 class="text-3xl font-bold text-muted-color">{{
                                formatRupiah(Number(accounting?.profit) as
                                    number -
                                    (minus as
                                        number)) }}</h1>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <DataTable :value="accounting?.profitLooseInvoices" tableStyle="min-width: 50rem" class="mt-4"
                        :lazy="true">
                        <Column header="Nomor Invoice">
                            <template #body="slotProps">
                                <span>{{ slotProps.data?.invoice?.number }}</span>
                            </template>
                        </Column>
                        <template #empty>
                            <h1 class="font-bold">TIDAK ADA DATA</h1>
                        </template>
                    </DataTable>
                </div>
                <div class="card">
                    <DataTable :value="accounting?.additionals" tableStyle="min-width: 50rem" class="mt-4" :lazy="true">
                        <Column header="Catatan">
                            <template #body="slotProps">
                                <span>{{ slotProps.data?.note }}</span>
                            </template>
                        </Column>
                        <Column header="Jumlah">
                            <template #body="slotProps">
                                <span>{{ formatRupiah(slotProps.data?.amount) }}</span>
                            </template>
                        </Column>
                        <template #empty>
                            <h1 class="font-bold">TIDAK ADA DATA</h1>
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
</template>
