<script setup lang="ts">
import Default from './default.vue';
import Invoice from './invoice.vue';


</script>

<template>
    <Tabs value="0">
        <TabList>
            <Tab value="0">Aktifitas Pekerja</Tab>
            <Tab value="1">Aktifitas Invoice</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="0">
                <Default />
            </TabPanel>
            <TabPanel value="1">
                <Invoice />
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>
