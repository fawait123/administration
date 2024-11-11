<script setup lang="ts">
import { ref } from 'vue';
import ActivityForm from './partials/ActivityForm.vue';
import AdditionalForm from './partials/AdditionalForm.vue';
import InputText from 'primevue/inputtext';

const tabRef = ref<string>("0")
const openModal = ref<boolean>(false)
const totalData = ref<number>(1)
const activityComponent = ref<InstanceType<typeof ActivityForm> | null>(null)
const additionalComponent = ref<InstanceType<typeof AdditionalForm> | null>(null)

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
            <Tabs value="0" v-on:update:value="changeTab">
                <TabList>
                    <Tab value="0">Invoice Aktifitas</Tab>
                    <Tab value="1">Invoice Tambahan</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <ActivityForm :edit="false" :total-data="totalData" ref="activityComponent" />
                    </TabPanel>
                    <TabPanel value="1">
                        <AdditionalForm :edit="false" :total-data="totalData" ref="additionalComponent" />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>
