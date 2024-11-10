<script setup lang="ts">
import { menuItem } from '@/constant';
import { ref } from 'vue';

const accesses = ref(menuItem)
const model = defineModel()
</script>

<template>
    <div class="grid grid-cols-2">
        <div class="flex flex-col gap-4 mb-4" v-for="(access, i) in accesses" :key="i">
            <h1 class="font-bold">{{ access.label }}</h1>
            <div class="flex gap-2 flex-col">
                <div class="flex items-center gap-2" v-for="(item, index) in access.items" :key="index">
                    <Checkbox :inputId="item.label" name="access" :value="item.label" v-model="model"
                        :disabled="item.label == 'Dashboard' ? true : false" />
                    <label :for="item.label">{{ item.label }} </label>
                </div>
            </div>
        </div>
    </div>
</template>
