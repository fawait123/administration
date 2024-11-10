<script setup lang="ts">
import { onMounted, ref } from 'vue';
import NotificationComponent from './Partials/NotificationComponent.vue';
import CardItem from './Partials/CardItem.vue';
import doRequest from '@/helpers/do-request.helper';

const cardData = ref<{
    totalActivity: number,
    totalInvoice: number
}>({
    totalActivity: 0,
    totalInvoice: 0
})

onMounted(() => {
    getCardData()
});


const getCardData = async () => {
    try {
        const response = await doRequest({
            url: '/dashboard/card',
            method: 'get'
        })

        const data = response.data
        cardData.value = {
            totalActivity: data.totalActivity,
            totalInvoice: data.totalInvoice
        }
    } catch (error) {
        console.log(error)
    }
}

</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <CardItem title="Total Invoice" :total="cardData.totalInvoice" icon="pi-dollar" />
        <CardItem title="Total Aktifitas" :total="cardData.totalActivity" icon="pi-chart-pie" />
        <CardItem title="Keuntungan" :total="cardData.totalInvoice - cardData.totalActivity" icon="pi-chart-line" />
        <CardItem title="Persentase" :total="Math.floor(cardData.totalActivity / cardData.totalInvoice * 100)"
            :persentase="true" icon="pi-percentage" />

        <div class="col-span-12 xl:col-span-12">
            <NotificationComponent />
        </div>
    </div>
</template>
