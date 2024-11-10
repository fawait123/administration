<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, type Component } from 'vue';
import doRequest from '@/helpers/do-request.helper';
import { ResponseMessage } from '@/helpers';
import type { IPagination } from '@/interfaces/index'
import type { DataTablePageEvent } from 'primevue/datatable';

export interface IColumnTable {
    field: string,
    header: string,
    sortable?: boolean,
    component?: Component,
}


const props = withDefaults(defineProps<{
    getUrl: string,
    columns: IColumnTable[],
    params?: Record<string, any>,
    exportButton?: boolean,
    addButton?: boolean,
    deleteButton?: boolean
}>(), {
    addButton: true,
    deleteButton: true,
    exportButton: false
})
const emmit = defineEmits()

const toast = useToast();
const dt = ref();
const users = ref<IPagination<any>>({
    value: [],
    pageLinkSize: 10,
    rowsPerPageOptions: [10, 20, 50, 100],
    lazy: true,
    loading: false,
    first: 0,
    rows: 10,
    totalRecords: 0,
    search: null
});
const deleteuserDialog = ref(false);
const deleteusersDialog = ref(false);
const user = ref<any>({});
const selectedusers = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function openNew() {
    emmit('onAdd')
}

const getData = async () => {
    users.value.loading = true;
    try {
        const userRequest = await doRequest({
            url: props.getUrl,
            method: "get",
            params: {
                page: Math.floor(users.value.first / users.value.rows) + 1, // Calculate page number
                limit: users.value.rows,
                search: users.value.search,
                ...props.params
            }
        })
        users.value.value = userRequest.data.result;
        users.value.totalRecords = userRequest.data.count;
        users.value.loading = false;
    } catch (error: any) {
        users.value.loading = false;
        toast.add({ severity: 'error', summary: "Terjadi Kesalahan", detail: ResponseMessage.message(error), life: 3000 })
    }
}

const onPagination = (event: DataTablePageEvent) => {
    users.value.first = event.page * event.rows; // Set first index correctly
    users.value.rows = event.rows; // Update the number of rows
    getData()
}

const onSearch = (event: KeyboardEvent) => {
    const target = event.target as any
    if (event.key == "Enter") {
        users.value.search = target.value;
        getData()
    }
}

function edituser(data: any) {
    emmit('onEdit', data)
}

function confirmDeleteuser(prod: any) {
    user.value = prod;
    deleteuserDialog.value = true;
}

const deleteuser = async () => {
    try {
        await doRequest({
            url: `${props.getUrl}/${user.value.id}`,
            method: "DELETE",
        })
        deleteuserDialog.value = false;
        user.value = {};
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil dihapus', life: 3000 });
        getData()
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi kesalahan', detail: ResponseMessage.message(error), life: 3000 });
    }
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteusersDialog.value = true;
}

const deleteSelectedusers = async () => {
    try {
        await Promise.all(
            selectedusers.value.map(async (item: any) => {
                await doRequest({
                    url: `${props.getUrl}/${item.id}`,
                    method: "DELETE",
                })
            })
        )
        deleteusersDialog.value = false;
        selectedusers.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'users Deleted', life: 3000 });
        getData()
    } catch (error: any) {
        toast.add({ severity: 'success', summary: 'Terjadi kesalahan', detail: ResponseMessage.message(error), life: 3000 });
    }
}

export interface ITableExpose {
    getData: () => void,
    confirmDeleteuser: (data: any) => void
}

defineExpose<ITableExpose>({ getData, confirmDeleteuser })
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6"
                v-show="props.addButton == true || props.deleteButton == true || props.exportButton == true">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew"
                        v-show="props.addButton" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" v-show="props.deleteButton"
                        @click="confirmDeleteSelected" :disabled="!selectedusers || !selectedusers.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV"
                        v-show="props.exportButton" />
                </template>
            </Toolbar>

            <DataTable ref="dt" :lazy="users.lazy" v-model:selection="selectedusers" :value="users.value" dataKey="id"
                :paginator="true" :rows="users.rows" :filters="filters" :first="users.first"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="users.rowsPerPageOptions" :page-link-size="users.pageLinkSize"
                :loading="users.loading" :total-records="users.totalRecords" v-on:page="onPagination"
                currentPageReportTemplate="Menampilkan {first} ke {last} dari {totalRecords} Pengguna">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Kelola Pengguna</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" @keyup="onSearch" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>
                <template #empty>
                    <div class="p-4 flex justify-center items-center gap-4 flex-col">
                        <i class="pi pi-database text-slate-400" style="font-size: 40px;"></i>
                        <h1 class="font-bold text-slate-400">Data tidak ditemukan</h1>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column :field="column.field" :header="column.header" :sortable="column.sortable"
                    style="min-width: 12rem" v-for="(column, i) in props.columns" :key="i">
                    <template #body="slotProps" v-if="column.component">
                        <!-- render component -->
                        <component :is="column.component" :data="slotProps.data" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem" header="#" v-if="!$slots.actionButton">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edituser(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteuser(slotProps.data)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem" header="#" v-else>
                    <template #body="slotProps">
                        <slot name="actionButton" :data="slotProps.data" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="deleteuserDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user">Are you sure you want to delete <b>{{ user.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteuserDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteuser" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteusersDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user">Are you sure you want to delete the selected users?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteusersDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedusers" />
            </template>
        </Dialog>
    </div>
</template>
