<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Approve from './partials/Approve.vue';
import Global from './partials/Global.vue';
import NeedApproval from './partials/NeedApproval.vue';
import Reject from './partials/Reject.vue';

const approveRef = ref<InstanceType<typeof Approve> | null>(null);
const needApprovaRef = ref<InstanceType<typeof NeedApproval> | null>(null);
const rejectRef = ref<InstanceType<typeof Reject> | null>(null);
const globalRef = ref<InstanceType<typeof Global> | null>(null);

const changeTab = (value: string) => {
    switch (value) {
        case 'need-approval':
            if (needApprovaRef.value) {
                needApprovaRef.value.getData();
            }
            break;
        case 'approve':
            if (approveRef.value) {
                approveRef.value.getData();
            }
            break;
        case 'reject':
            if (rejectRef.value) {
                rejectRef.value.getData();
            }
            break;
        case 'global':
            if (globalRef.value) {
                globalRef.value.tableRef.getData();
            }
            break;
    }
};

onMounted(() => {
    if (globalRef.value) {
        globalRef.value.tableRef.getData();
    }
});
</script>

<template>
    <Tabs value="3">
        <TabList>
            <Tab value="0" @click="changeTab('need-approval')">Need Approval</Tab>
            <Tab value="1" @click="changeTab('approve')">Approve</Tab>
            <Tab value="2" @click="changeTab('reject')">Reject</Tab>
            <Tab value="3" @click="changeTab('global')">Global</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="0">
                <NeedApproval ref="needApprovaRef" />
            </TabPanel>
            <TabPanel value="1">
                <Approve ref="approveRef" />
            </TabPanel>
            <TabPanel value="2">
                <Reject ref="rejectRef" />
            </TabPanel>
            <TabPanel value="3">
                <Global ref="globalRef" />
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>
