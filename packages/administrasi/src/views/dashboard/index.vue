<script setup lang="ts">
import { onMounted, ref } from 'vue';
import NotificationComponent from './Partials/NotificationComponent.vue';
import NotificationPayment from './Partials/NotificationPayment.vue';
import CardItem from './Partials/CardItem.vue';
import doRequest from '@/helpers/do-request.helper';

const cardData = ref<{
    totalActivity: number;
    totalInvoice: number;
}>({
    totalActivity: 0,
    totalInvoice: 0
});

onMounted(() => {
    getCardData();
});

const getCardData = async () => {
    try {
        const response = await doRequest({
            url: '/dashboard/card',
            method: 'get',
        });

        const data = response.data;
        cardData.value = {
            totalActivity: data.totalActivity,
            totalInvoice: data.totalInvoice
        };
    } catch (error) {
        console.log(error);
    }
};
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <CardItem title="Total Invoice" :total="cardData.totalInvoice" icon="pi-dollar" />
        <CardItem title="Total Aktifitas" :total="cardData.totalActivity" icon="pi-chart-pie" />
        <CardItem title="Keuntungan" :total="cardData.totalInvoice - cardData.totalActivity" icon="pi-chart-line" />
        <CardItem title="Persentase" :total="Math.floor((cardData.totalActivity / cardData.totalInvoice) * 100)"
            :persentase="true" icon="pi-percentage" />

        <div class="col-span-12 xl:col-span-12">
            <Tabs value="0">
                <TabList>
                    <Tab value="0">Pemberitahuan Invoice</Tab>
                    <Tab value="1">Pembertahuan Pembayaran</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <NotificationComponent />
                    </TabPanel>
                    <TabPanel value="1">
                        <NotificationPayment />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>
