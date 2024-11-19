<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import useValidation from '@/helpers/validation.helper';
import { memberWorkResultSchema } from '@/schema/index';
import { useToast } from 'primevue/usetoast';
import { ResponseMessage } from '@/helpers';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import CustomSelectGroup from '@/components/input/CustomSelectGroup.vue';
import doRequest from '@/helpers/do-request.helper';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLoadingStore } from '@/store';
import LoadingComponent from '@/composable/LoadingComponent.vue';

const loadingStore = useLoadingStore();

const router = useRouter();
const route = useRoute();

const toast = useToast();
const employeeData = ref<any[]>([]);
const activityData = ref<any[]>([]);
const openModal = ref<boolean>(false);
const deleteActivity = ref<boolean>(false);
const selectedData = ref<string[]>();
const totalData = ref<number>(1);
const editData = ref<Record<string, any>>({});
const selectedOptions = ref<
    {
        index: number;
        id: string;
    }[]
>([]);
const activityTobeDeleted = ref<Record<string, any> | null>(null);

const getById = async () => {
    loadingStore.setLoading(true);
    try {
        const response = await doRequest({
            url: '/member-work-result/' + route.params.id,
            method: 'get'
        });
        const data = response.data;
        editData.value = data;
        formRef.value.employeeId = data.employeeId;
        formRef.value.date = data.date;
        formRef.value.activities = data.activities.map((item: any) => {
            return {
                plot: item.plot,
                wide: item.wide?.toString(),
                price: item.price?.toString(),
                activityId: item.ActivityId,
                ql: item.ql,
                subTotal: item.subTotal,
                id: item.id
            };
        });
        formRef.value.bon = data.bon.map((item: any) => {
            return {
                note: item.note,
                total: item.total
            };
        });
        selectedOptions.value = data.activities.map((item: any, i: number) => {
            return {
                index: i,
                id: item.ActivityId
            };
        });
        loadingStore.setLoading(false);
    } catch (error) {
        loadingStore.setLoading(false);
    }
};

const getEmployee = async () => {
    const employeeRequest = await doRequest({
        url: 'employee',
        method: 'get',
        params: {
            page: 1, // Calculate page number
            limit: 100
        }
    });

    const data = employeeRequest.data.result;
    employeeData.value = data;
};

const getActivity = async () => {
    const employeeRequest = await doRequest({
        url: 'activity/all',
        method: 'get',
        params: {
            where: {
                type: 'DEFAULT'
            }
        }
    });

    const data = employeeRequest.data;
    activityData.value = data;
};

onMounted(() => {
    getEmployee();
    getActivity();
    getById();
});

const formRef = ref<{
    employeeId: string | null;
    date: string | null;
    activities: {
        plot: string;
        wide: string;
        price: string;
        activityId: string;
        ql: string;
        subTotal: number;
        id: string | null;
    }[];
    bon: {
        note: string;
        total: string;
    }[];
}>({
    employeeId: null,
    date: null,
    activities: [
        {
            plot: '',
            wide: '0',
            price: '0',
            activityId: '',
            ql: '',
            subTotal: 0,
            id: null
        }
    ],
    bon: [
        {
            note: '',
            total: '0'
        }
    ]
});

const { validate, isValid, getErros, getError, scrolltoError } = useValidation(memberWorkResultSchema, formRef, {
    mode: 'lazy'
});

const addActivity = () => {
    formRef.value.activities.push({
        plot: '',
        wide: '0',
        price: '0',
        activityId: '',
        ql: '',
        subTotal: 0,
        id: null
    });
};

const removeActivity = (index: number) => {
    formRef.value.activities.splice(index, 1);
};

const addBon = () => {
    formRef.value.bon.push({
        note: '',
        total: '0'
    });
};

const removeBon = (index: number) => {
    formRef.value.bon.splice(index, 1);
};

const handlePlusMinusActivity = (index: number, activity: Record<string, any>) => {
    if (index == 0) {
        addActivity();
    } else {
        if (activity.id != null) {
            deleteActivity.value = true;
            activityTobeDeleted.value = activity;
        } else {
            removeActivity(index);
        }
    }
};

const handlePlusMinusBon = (index: number) => {
    if (index == 0) {
        addBon();
    } else {
        removeBon(index);
    }
};

const pressOk = () => {
    if (selectedData.value?.includes('activity')) {
        generateDataActivity();
    }

    if (selectedData.value?.includes('bon')) {
        generateDataBon();
    }

    openModal.value = !openModal.value;
};

const generateDataActivity = () => {
    for (let index = 0; index < totalData.value; index++) {
        addActivity();
    }
};

const generateDataBon = () => {
    for (let index = 0; index < totalData.value; index++) {
        addBon();
    }
};

const handleSubmit = async () => {
    try {
        await validate();
        if (isValid.value) {
            await doRequest({
                url: '/member-work-result/' + route.params.id,
                method: 'PATCH',
                data: {
                    employeeId: formRef.value.employeeId,
                    date: formRef.value.date,
                    activities: formRef.value.activities.map((item) => {
                        return {
                            plot: item.plot,
                            wide: +item.wide,
                            price: +item.price,
                            activityId: item.activityId,
                            ql: item.ql,
                            subTotal: item.subTotal,
                            id: item.id
                        };
                    }),
                    bon: formRef.value.bon
                        .filter((el) => el.note != '')
                        .map((item) => {
                            return {
                                note: item.note,
                                total: +item.total
                            };
                        })
                }
            });
            toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data Hasil Kerja Anggota Berhasil ditambah', life: 3000 });
            router.push({ name: 'member-work-result' });
            console.log('success');
        } else {
            scrolltoError('.text-red-500');
        }
    } catch (error: any) {
        console.log(error.message);
        toast.add({ severity: 'error', summary: 'Opps!', detail: ResponseMessage.message(error), life: 3000 });
    }
};

const calculateprice = (event: any, i: number) => {
    formRef.value.activities[i].subTotal = event * +formRef.value.activities[i].wide;
};

const calculateWide = (event: any, i: number) => {
    formRef.value.activities[i].subTotal = event * +formRef.value.activities[i].price;
};

const handleSelectOption = (i: number, data: any) => {
    selectedOptions.value.push({
        id: data,
        index: i
    });
};

const availableOptions = (i: number) => {
    const filtered = activityData.value.filter((item) => !selectedOptions.value.filter((el) => el.index != i).some((el) => el.id == item.id));

    return filtered;
};

window.addEventListener('keydown', (event) => {
    // Cek apakah tombol Ctrl ditekan
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault(); // Mencegah perilaku default jika perlu (misal untuk mencegah pencarian browser)
        console.log('Ctrl + K was pressed');
        // Tambahkan aksi lain di sini
        openModal.value = !openModal.value;
    }
});

const handleDeleteActivity = async () => {
    try {
        await doRequest({
            url: '/member-work-result/activity/' + activityTobeDeleted.value?.id,
            method: 'DELETE'
        });
        activityTobeDeleted.value = null;
        deleteActivity.value = false;
        getById();
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Terjadi kesahalan', detail: error.message, life: 3000 });
        deleteActivity.value = false;
    }
};
</script>

<template>
    <div>
        <LoadingComponent v-if="loadingStore.loading" />
        <div class="flex justify-center items-center" v-else>
            <Dialog v-model:visible="openModal" :style="{ width: '450px' }" header="Masukan pilihan anda" :modal="true">
                <div class="flex flex-col justify-center gap-4">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center">
                            <Checkbox inputId="activity" v-model="selectedData" name="activity" value="activity" />
                            <label for="activity" class="ml-2"> Kegiatan </label>
                        </div>
                        <div class="flex items-center">
                            <Checkbox inputId="bon" v-model="selectedData" name="bon" value="bon" />
                            <label for="bon" class="ml-2"> Hutang </label>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <label for="totalData" class="ml-2">Jumlah Data</label>
                        <InputText type="number" inputId="totalData" v-model="totalData" name="total" />
                    </div>
                </div>
                <template #footer>
                    <Button label="Yes" icon="pi pi-check" text @click="pressOk" />
                </template>
            </Dialog>
            <Dialog v-model:visible="deleteActivity" :style="{ width: '450px' }" header="Hapus data" :modal="true">
                <span>Yakin ingin menghapus data (<span class="font-bold">Data didatabase akan ikut terhapus</span>)
                    ?</span>
                <template #footer>
                    <Button label="Yes" icon="pi pi-check" text @click="handleDeleteActivity" />
                </template>
            </Dialog>
            <div class="max-w-[60%] min-w-[70%]">
                <div class="card">
                    <span>Tekan <span class="font-bold text-primary">Ctl + K</span> untuk membuat lebih banyak</span>
                </div>
                <div class="card">
                    <div class="grid grid-cols-2 gap-4">
                        <CustomSelectGroup :editable="true" label="Pilih Pekerja" option-value="id"
                            v-model="formRef.employeeId" :options="employeeData" optionLabel="name"
                            :invalid="!!getError('employeeId')" :error-message="getError('employeeId')"
                            placeholder="Pilih Pekerja" class="w-full" />
                        <CustomInputGroup type="date" placeholder="Masukan Periode" label="Periode"
                            v-model="formRef.date" :invalid="!!getError('date')" :error-message="getError('date')"
                            class-name="mb-8" />
                    </div>
                </div>
                <h6 class="font-semibold text-xl mb-2">KEGIATAN</h6>
                <div class="card relative" v-for="(activity, i) in formRef.activities" :key="i">
                    <div class="grid grid-cols-3 gap-4">
                        <div class="flex flex-col gap-8">
                            <CustomInputGroup label="Petak" :invalid="!!getErros('activities', 'plot', i)"
                                :name="`plot[${[i]}]`" :error-message="getErros('activities', 'plot', i)"
                                v-model="activity.plot" type="text" placeholder="Petak" class="w-full" />
                            <CustomSelectGroup @valueChange="(value: any) => handleSelectOption(i, value)"
                                :editable="true" label="Pilih Aktifitas" :options="activityData" option-label="name"
                                option-value="id" :error-message="getErros('activities', 'activityId', i)"
                                :name="`activity[${[i]}]`" :invalid="!!getErros('activities', 'activityId', i)"
                                v-model="activity.activityId" type="text" placeholder="Kegiatan" class="w-full" />
                        </div>
                        <div class="flex flex-col gap-8">
                            <CustomInputGroup label="Luas" :error-message="getErros('activities', 'wide', i)"
                                @input="calculateWide(activity.wide, i)" :name="`wide[${[i]}]`"
                                :invalid="!!getErros('activities', 'wide', i)" v-model="activity.wide" type="number"
                                placeholder="Luas" class="w-full" />
                            <CustomInputGroup label="QL" :error-message="getErros('activities', 'ql', i)"
                                :name="`ql[${[i]}]`" :invalid="!!getErros('activities', 'ql', i)" v-model="activity.ql"
                                type="text" placeholder="QL" class="w-full" />
                        </div>
                        <div class="flex flex-col gap-8">
                            <CustomInputGroup label="Harga" :error-message="getErros('activities', 'price', i)"
                                @input="calculateprice(activity.price, i)" :name="`price[${[i]}]`"
                                :invalid="!!getErros('activities', 'price', i)" v-model="activity.price" type="number"
                                placeholder="Harga" class="w-full" />
                            <CustomInputGroup label="Jumlah" :error-message="getErros('activities', 'subTotal', i)"
                                :readonly="true" :name="`subTotal[${[i]}]`"
                                :invalid="!!getErros('activities', 'subTotal', i)" v-model="activity.subTotal"
                                type="text" placeholder="Jumlah" class="w-full" />
                        </div>
                    </div>
                    <div class="w-10 h-10 rounded-full text-white flex justify-center items-center absolute top-[-10px] right-[-5px] cursor-pointer"
                        @click="handlePlusMinusActivity(i, activity)" :class="i == 0 ? 'bg-primary' : 'bg-red-500'">
                        <span :class="i == 0 ? 'pi pi-plus' : 'pi pi-minus'"></span>
                    </div>
                </div>
                <h6 class="font-semibold text-xl mb-2">HUTANG</h6>
                <div class="card relative" v-for="(bon, i) in formRef.bon" :key="i">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-8">
                            <CustomInputGroup label="Keterangan" :error-message="getErros('bon', 'note', i)"
                                :name="`note[${[i]}]`" :invalid="!!getErros('bon', 'note', i)" v-model="bon.note"
                                type="text" placeholder="Keterangan" class="w-full" />
                        </div>
                        <div class="flex flex-col gap-8">
                            <CustomInputGroup label="Total" :error-message="getErros('bon', 'total', i)"
                                :name="`total[${[i]}]`" :invalid="!!getErros('bon', 'total', i)" v-model="bon.total"
                                type="number" placeholder="Total" class="w-full" />
                        </div>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-primary text-white flex justify-center items-center absolute top-[-10px] right-[-5px] cursor-pointer"
                        @click="handlePlusMinusBon(i)" :class="i == 0 ? 'bg-primary' : 'bg-red-500'">
                        <span :class="i == 0 ? 'pi pi-plus' : 'pi pi-minus'"></span>
                    </div>
                </div>
                <div class="flex justify-end">
                    <div class="flex gap-4">
                        <Button label="KEMBALI" outlined />
                        <Button label="SIMPAN" type="button" @click="handleSubmit" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
