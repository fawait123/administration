<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import useValidation from '@/helpers/validation.helper';
import { invoiceSchema } from '@/schema/index';
import { useToast } from 'primevue/usetoast';
import { ResponseMessage } from '@/helpers';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import CustomSelectGroup from '@/components/input/CustomSelectGroup.vue';
import doRequest from '@/helpers/do-request.helper';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CustomMultiSelectGroup from '@/components/input/CustomMultiSelectGroup.vue';
import { InputNumber } from 'primevue';
import ToastComponent from '../../../components/ToastComponent.vue';

const props = defineProps<{
    totalData: number,
    edit: boolean
}>();

const emmit = defineEmits();

const router = useRouter();
const route = useRoute();
const toast = useToast();
const employeeData = ref<any[]>([]);
const activityData = ref<any[]>([]);
const memberWorkResultData = ref<any[]>([]);
const selectedMemberWorkData = ref<Record<string, any>>({});
const selectedOptions = ref<
    {
        index: number;
        id: string;
    }[]
>([]);
const dataTobeDeleted = ref<Record<string, any> | null>(null);
const deleteModal = ref<boolean>(false);

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
        url: 'activity',
        method: 'get',
        params: {
            page: 1, // Calculate page number
            limit: 100000,
        }
    });

    const data = employeeRequest.data.result;
    activityData.value = data;
};

const getMemberWorkResult = async () => {
    const employeeRequest = await doRequest({
        url: 'member-work-result/activities',
        method: 'get',
        params: {
            page: 1, // Calculate page number
            limit: 100
        }
    });

    const data = employeeRequest.data;
    memberWorkResultData.value = data.map((item: any) => {
        return {
            label: item?.memberWorkResult?.employee?.name + ' ' + item.plot + ' ' + item?.activity?.name || '',
            value: item.id,
            wide: item.wide
        };
    });
};

onMounted(() => {
    getEmployee();
    getActivity();
    getMemberWorkResult();
});

const formRef = ref<{
    number: string | null;
    invoiceActivites: {
        bapNumber: string;
        zone: string;
        activityId: string;
        wide: string;
        price: string;
        total: string;
        // details: [];
        id: string | null;
        retensi: boolean;
    }[];
    invoiceRetensi: {
        note: string;
        amount: string;
        id?: string | null;
    }[];
}>({
    number: null,
    invoiceActivites: [
        {
            bapNumber: '',
            zone: '',
            activityId: '',
            wide: '0',
            price: '0',
            total: '0',
            // details: [],
            id: null,
            retensi: false
        }
    ],
    invoiceRetensi: [
        {
            note: '',
            amount: '0',
            id: null
        }
    ]
});

const { validate, isValid, getErros, getError, scrolltoError } = useValidation(invoiceSchema, formRef, {
    mode: 'lazy'
});

const addActivity = () => {
    formRef.value.invoiceActivites.push({
        bapNumber: '',
        zone: '',
        activityId: '',
        wide: '0',
        price: '0',
        total: '0',
        // details: [],
        id: null,
        retensi: false
    });
};

const addRetensi = () => {
    formRef.value.invoiceRetensi.push({
        note: '',
        amount: '0',
        id: null
    });
};

const removeActivity = (index: number) => {
    formRef.value.invoiceActivites.splice(index, 1);
};

const removeRetensi = (index: number) => {
    formRef.value.invoiceRetensi.splice(index, 1);
};

const handlePlusMinusActivity = (index: number, activity: Record<string, any>) => {
    if (index == 0) {
        addActivity();
    } else {
        if (props.edit && activity.id != null) {
            deleteModal.value = true;
            dataTobeDeleted.value = activity;
        } else {
            removeActivity(index);
        }
    }
};

const handlePlusMinusRetensi = (index: number, activity: Record<string, any>) => {
    if (index == 0) {
        addRetensi();
    } else {
        if (props.edit && activity.id != null) {
            deleteModal.value = true;
            dataTobeDeleted.value = activity;
        } else {
            removeRetensi(index);
        }
    }
};

const generateDataActivity = () => {
    for (let index = 0; index < props.totalData; index++) {
        addActivity();
    }
};
const handleSubmit = async () => {
    try {
        await validate();
        if (isValid.value) {
            await doRequest({
                url: props.edit == true ? '/invoice/' + route.params.id : '/invoice',
                method: props.edit == true ? 'patch' : 'post',
                data: {
                    number: formRef.value.number,
                    invoiceActivites: formRef.value.invoiceActivites.map((item) => {
                        return {
                            bapNumber: item.bapNumber,
                            zone: item.zone,
                            wide: +item.wide,
                            price: +item.price,
                            total: +item.total,
                            activityId: item.activityId,
                            retensi: item.retensi,
                            // details: item.details.map((det) => {
                            //     return {
                            //         memberWorkResultId: det
                            //     };
                            // }),
                            id: item.id
                        };
                    }),
                    invoiceRetensi:
                        formRef.value.invoiceRetensi.filter((el) => el.note != '').length > 0
                            ? formRef.value.invoiceRetensi.map((item) => {
                                return {
                                    note: item.note,
                                    amount: +item.amount,
                                    id: item.id
                                };
                            })
                            : []
                }
            });
            toast.add({ severity: 'success', summary: 'Berhasil', detail: `Data invoice berhasil ${props.edit ? 'diubah' : 'ditambah'}`, life: 3000 });
            router.push({ name: 'invoice' });
        } else {
            scrolltoError('.text-red-500');
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Opps!', detail: ResponseMessage.message(error), life: 3000, group: 'custom' });
    }
};

const calculateprice = (event: any, i: number) => {
    if (formRef.value.invoiceActivites[i].retensi) {
        formRef.value.invoiceActivites[i].total = Math.round((event * +formRef.value.invoiceActivites[i].wide * 90) / 100).toString();
    } else {
        formRef.value.invoiceActivites[i].total = (event * +formRef.value.invoiceActivites[i].wide).toString();
    }
};

const calculateWide = (event: any, i: number) => {
    if (formRef.value.invoiceActivites[i].retensi) {
        formRef.value.invoiceActivites[i].total = Math.round((event * +formRef.value.invoiceActivites[i].price * 90) / 100).toString();
    } else {
        formRef.value.invoiceActivites[i].total = (event * +formRef.value.invoiceActivites[i].price).toString();
    }
};

const handleRetensi = (value: boolean, activity: Record<string, any>, i: number) => {
    if (value) {
        formRef.value.invoiceActivites[i].total = Math.round((+activity.price * +activity.wide * 90) / 100).toString();
    } else {
        formRef.value.invoiceActivites[i].total = (+activity.price * +activity.wide).toString();
    }
};

const handleChangeMemberWork = (value: string[], i: number) => {
    const filter = memberWorkResultData.value.filter((el) => value.includes(el.value));
    formRef.value.invoiceActivites[i].wide = `${filter.reduce((prev, next) => prev + next.wide, 0)}`;
    selectedMemberWorkData.value = {
        ...selectedMemberWorkData.value,
        [i]: filter
    };
};

const availableOptions = (i: number) => {
    const filtered = activityData.value.filter((item) => !selectedOptions.value.filter((el) => el.index != i).some((el) => el.id == item.id));
    return filtered;
};

const handleSelectOption = (i: number, data: any) => {
    selectedOptions.value.push({
        id: data,
        index: i
    });
};

const handleDelete = async () => {
    emmit('deleteActivity');
};

defineExpose({ generateDataActivity, formRef, selectedOptions, dataTobeDeleted, deleteModal });
</script>

<template>
    <div class="flex justify-center items-center">
        <div class="w-full">
            <div class="card">
                <span>Tekan <span class="font-bold text-primary">Ctl + K</span> untuk membuat lebih banyak</span>
            </div>
            <div class="card">
                <div class="grid grid-cols-1">
                    <CustomInputGroup type="text" placeholder="Masukan Nomor Invoice" label="Nomor Invoice"
                        v-model="formRef.number" :invalid="!!getError('number')" :error-message="getError('number')"
                        class-name="mb-8" />
                </div>
            </div>
            <h6 class="font-semibold text-xl mb-2">INVOICE KEGIATAN</h6>
            <div class="card relative" v-for="(activity, i) in formRef.invoiceActivites" :key="i">
                <div class="grid grid-cols-3 gap-4">
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup label="Nomor BAP" :invalid="!!getErros('invoiceActivites', 'bapNumber', i)"
                            :name="`plot[${[i]}]`" :error-message="getErros('invoiceActivites', 'bapNumber', i)"
                            v-model="activity.bapNumber" type="text" placeholder="Nomor BAP" class="w-full" />

                        <CustomInputGroup label="Luas" :error-message="getErros('invoiceActivites', 'wide', i)"
                            @input="calculateWide(activity.wide, i)" :name="`wide[${[i]}]`"
                            :invalid="!!getErros('invoiceActivites', 'wide', i)" v-model="activity.wide" type="number"
                            placeholder="Luas" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup label="Zona" :error-message="getErros('invoiceActivites', 'zone', i)"
                            :name="`zone[${[i]}]`" :invalid="!!getErros('invoiceActivites', 'zone', i)"
                            v-model="activity.zone" type="text" placeholder="zone" class="w-full" />

                        <CustomInputGroup label="Harga" :error-message="getErros('invoiceActivites', 'price', i)"
                            @input="calculateprice(activity.price, i)" :name="`price[${[i]}]`"
                            :invalid="!!getErros('invoiceActivites', 'price', i)" v-model="activity.price" type="number"
                            placeholder="Harga" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-8">
                        <CustomSelectGroup @valueChange="(value: any) => handleSelectOption(i, value)" :editable="true"
                            label="Pilih Aktifitas" :options="activityData" option-label="name" option-value="id"
                            :error-message="getErros('invoiceActivites', 'activityId', i)" :name="`activity[${[i]}]`"
                            :invalid="!!getErros('invoiceActivites', 'activityId', i)" v-model="activity.activityId"
                            type="text" placeholder="Kegiatan" class="w-full" />

                        <div class="flex-auto">
                            <label for="ssn" class="font-bold block">Jumlah</label>
                            <InputNumber id="ssn" v-model="activity.total" mode="currency" currency="IDR" readonly
                                placeholder="999-99-9999" fluid />
                        </div>
                    </div>
                    <div class="flex gap-8">

                        <div class="flex items-center gap-2">
                            <Checkbox binary :inputId="`retensi${i}`"
                                @value-change="(value: boolean) => handleRetensi(value, activity, i)"
                                v-model="activity.retensi" />
                            <label :for="`retensi${i}`">Retensi</label>
                        </div>
                    </div>
                </div>
                <div class="w-10 h-10 rounded-full text-white flex justify-center items-center absolute top-[-10px] right-[-5px] cursor-pointer"
                    @click="handlePlusMinusActivity(i, activity)" :class="i == 0 ? 'bg-primary' : 'bg-red-500'">
                    <span :class="i == 0 ? 'pi pi-plus' : 'pi pi-minus'"></span>
                </div>
            </div>
            <h6 class="font-semibold text-xl mb-2">INVOICE RETENSI</h6>
            <div class="card relative" v-for="(retensi, i) in formRef.invoiceRetensi" :key="i">
                <div class="grid grid-cols-1 gap-4">
                    <div class="grid grid-cols-2 gap-8">
                        <CustomInputGroup label="Keterangan" :invalid="!!getErros('invoiceRetensi', 'note', i)"
                            :name="`plot[${[i]}]`" :error-message="getErros('invoiceRetensi', 'note', i)"
                            v-model="retensi.note" type="text" placeholder="Keterangan" class="w-full" />
                        <CustomInputGroup label="Jumlah" :invalid="!!getErros('invoiceRetensi', 'amount', i)"
                            :name="`plot[${[i]}]`" :error-message="getErros('invoiceRetensi', 'amount', i)"
                            v-model="retensi.amount" type="text" placeholder="Jumlah" class="w-full" />
                    </div>
                </div>
                <div class="w-10 h-10 rounded-full text-white flex justify-center items-center absolute top-[-10px] right-[-5px] cursor-pointer"
                    @click="handlePlusMinusRetensi(i, activity)" :class="i == 0 ? 'bg-primary' : 'bg-red-500'">
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
        <Dialog v-model:visible="deleteModal" :style="{ width: '450px' }" header="Hapus data ?" :modal="true">
            <span>Apakah kamu yakin ingin menghapus data <span class="font-bold">(Data di dalam database akan ikut
                    terhapus)</span>?</span>

            <template #footer>
                <Button label="Yes" icon="pi pi-check" text @click="handleDelete" />
            </template>
        </Dialog>
        <ToastComponent />
    </div>
</template>
