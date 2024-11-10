<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { menuItem } from '@/constant/menuItem.constant';
import { useProfileStore } from '@/store/index';

const store = useProfileStore()
const model = ref(menuItem);

onBeforeMount(async () => {
    try {
        await store.getData()
        // Filter the menu based on allowed labels
        const filteredMenu = menuItem.map(category => {
            // Filter items in each category based on allowed labels
            const filteredItems = category.items.filter(item =>
                store.data.role.access.includes(item.label)
            );

            return { ...category, items: filteredItems };
        }).filter((el) => el.items.length > 0);

        model.value = filteredMenu
    } catch (error) {
        console.log('error', error)
    }
})


</script>

<template>
    <Suspense>
        <template #default>
            <!-- Your main component content goes here -->
            <ul class="layout-menu">
                <template v-for="(item, i) in model" :key="item">
                    <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
                    <li v-if="item.separator" class="menu-separator"></li>
                </template>
            </ul>
        </template>
        <template #fallback>
            <!-- Loading spinner or message while data is being fetched -->
            <div>Loading...</div>
        </template>
    </Suspense>
</template>

<style lang="scss" scoped></style>
