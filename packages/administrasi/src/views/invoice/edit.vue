<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ActivityForm from './partials/ActivityForm.vue';
import AdditionalForm from './partials/AdditionalForm.vue';
import InputText from 'primevue/inputtext';
import doRequest from '@/helpers/do-request.helper';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const toast = useToast()

const route = useRoute()
const tabRef = ref<string>("0")
const openModal = ref<boolean>(false)
const totalData = ref<number>(1)
const activityComponent = ref<InstanceType<typeof ActivityForm> | null>(null)
const additionalComponent = ref<InstanceType<typeof AdditionalForm> | null>(null)
const editData = ref<Record<string, any> | null>(null)


const getById = async () => {
    try {
        const response = await doRequest({
            method: 'get',
            url: 'invoice/' + route.params.id
        })

        const data = response.data
        editData.value = data;
        if (activityComponent.value) {
            activityComponent.value.formRef = {
                number: data.number,
                invoiceActivites: data.invoiceActivities.map((item: any) => {
                    return {
                        bapNumber: item.bapNumber,
                        zone: item.zone,
                        activityId: item.activityId,
                        wide: item.wide?.toString(),
                        price: item.price?.toString(),
                        total: item.total?.toString(),
                        details: item.details.map((el: any) => el.memberWorkResultActivityId),
                        id: item.id
                    }
                })
            }
            activityComponent.value.selectedOptions = data.invoiceActivities.map((item: any, i: number) => {
                return {
                    index: i,
                    id: item.activityId
                }
            })
        }

        if (additionalComponent.value) {
            additionalComponent.value.formRef = {
                number: data.number,
                invoiceAdditionals: data.invoiceAdditionals.map((item: any) => {
                    return {
                        activityId: item.activityId,
                        bapNumber: item.bapNumber,
                        amount: item.amount?.toString(),
                        id: item.id
                    }
                })

            }
            additionalComponent.value.selectedOptions = data.invoiceAdditionals.map((item: any, i: number) => {
                return {
                    index: i,
                    id: item.activityId
                }
            })
        }

    } catch (error) {
        console.log(error)
    }
}

onMounted(() => {
    getById()
})

const changeTab = (value: any) => {
    tabRef.value = value
}

const pressOk = () => {
    if (activityComponent.value && tabRef.value == "0") {
        activityComponent.value.generateDataActivity()
    }

    if (additionalComponent.value && tabRef.value == "1") {
        additionalComponent.value.generateDataBon()
    }

    openModal.value = false;
}

document.addEventListener('keydown', (event) => {
    // Cek apakah tombol Ctrl ditekan
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault(); // Mencegah perilaku default jika perlu (misal untuk mencegah pencarian browser)
        console.log('Ctrl + K was pressed');
        // Tambahkan aksi lain di sini
        openModal.value = true;
    }
})

const handleDelete = async () => {
    try {
        if (activityComponent.value) {
            await doRequest({
                url: "/invoice/activities/" + activityComponent.value.dataTobeDeleted.id,
                method: 'delete'
            })
            getById()
            activityComponent.value.dataTobeDeleted = null
            activityComponent.value.deleteModal = false;
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi kesalahan', detail: error.message, life: 3000 })
    }
}

const deleteAdditional = async (data: Record<string, any>) => {
    try {
        if (additionalComponent.value) {
            await doRequest({
                url: "/invoice/additional/" + data.id,
                method: 'delete'
            })
            getById()
            additionalComponent.value.deleteModal = false;
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi kesalahan', detail: error.message, life: 3000 })
    }
}

</script>

<template>
    <div>
        <Dialog v-model:visible="openModal" :style="{ width: '450px' }" header="Masukan pilihan anda" :modal="true">
            <div class="flex flex-col justify-center gap-4">
                <div class="flex flex-col">
                    <label for="totalData" class="ml-2">Jumlah Data</label>
                    <InputText type="number" inputId="totalData" v-model="totalData" name="total" />
                </div>
            </div>
            <template #footer>
                <Button label="Yes" icon="pi pi-check" text @click="pressOk" />
            </template>
        </Dialog>
        <div class="card">
            <Tabs :value="editData?.type == 'ACTIVITY' ? '0' : '1'" v-on:update:value="changeTab">
                <TabList>
                    <Tab value="0" :disabled="editData?.type != 'ACTIVITY'">Invoice Aktifitas</Tab>
                    <Tab value="1" :disabled="editData?.type != 'ADDITIONAL'">Invoice Tambahan</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <ActivityForm @deleteActivity="handleDelete" :edit="true" :total-data="totalData"
                            ref="activityComponent" />
                    </TabPanel>
                    <TabPanel value="1">
                        <AdditionalForm @handleDelete="deleteAdditional" :edit="true" :total-data="totalData"
                            ref="additionalComponent" />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>
