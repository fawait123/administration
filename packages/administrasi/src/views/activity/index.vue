<script setup lang="ts">
import Default from './default.vue';
import Invoice from './invoice.vue';


</script>

<template>
    <Tabs value="0">
        <TabList>
            <Tab value="0">Aktifitas</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="0">
                <Default />
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>
