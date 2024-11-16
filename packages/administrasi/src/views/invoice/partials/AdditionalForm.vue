<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import useValidation from '@/helpers/validation.helper';
import { invoiceAdditionalSchema } from '@/schema/index';
import { useToast } from 'primevue/usetoast';
import { ResponseMessage } from '@/helpers';
import CustomInputGroup from '@/components/input/CustomInputGroup.vue';
import CustomSelectGroup from '@/components/input/CustomSelectGroup.vue';
import doRequest from '@/helpers/do-request.helper';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Checkbox } from 'primevue';

const props = defineProps<{
    totalData: number;
    edit: boolean;
}>();
const emmit = defineEmits();

const router = useRouter();
const route = useRoute();

const toast = useToast();
const employeeData = ref<any[]>([]);
const activityData = ref<any[]>([]);
const memberWorkResultData = ref<any[]>([]);
const selectedOptions = ref<
    {
        index: number;
        id: string;
    }[]
>([]);
const deleteModal = ref<boolean>(false);
const dataTobeDeleted = ref<Record<string, any> | null>(null);

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
            limit: 100,
            where: {
                type: 'COMPANY'
            }
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
    invoiceAdditionals: {
        activityId: string;
        bapNumber: string;
        amount: string;
        id: string | null;
        rent: boolean;
    }[];
}>({
    number: null,
    invoiceAdditionals: [
        {
            activityId: '',
            bapNumber: '',
            amount: '0',
            id: null,
            rent: false
        }
    ]
});

const { validate, isValid, getErros, getError, scrolltoError } = useValidation(invoiceAdditionalSchema, formRef, {
    mode: 'lazy'
});

const addBon = () => {
    formRef.value.invoiceAdditionals.push({
        activityId: '',
        bapNumber: '',
        amount: '0',
        id: null,
        rent: false
    });
};

const removeBon = (index: number) => {
    formRef.value.invoiceAdditionals.splice(index, 1);
};

const handlePlusMinusBon = (index: number, bon: Record<string, any>) => {
    if (index == 0) {
        addBon();
    } else {
        if (props.edit && bon.id != null) {
            deleteModal.value = true;
            dataTobeDeleted.value = bon;
        } else {
            removeBon(index);
        }
    }
};

const generateDataBon = () => {
    for (let index = 0; index < props.totalData; index++) {
        addBon();
    }
};

const handleSubmit = async () => {
    try {
        await validate();
        if (isValid.value) {
            await doRequest({
                url: props.edit ? '/invoice/additional/' + route.params.id : '/invoice/additional',
                method: props.edit ? 'patch' : 'post',
                data: {
                    number: formRef.value.number,
                    invoiceAdditionals: formRef.value.invoiceAdditionals
                        .filter((el) => el.bapNumber != '')
                        .map((item) => {
                            return {
                                bapNumber: item.bapNumber,
                                amount: +item.amount,
                                activityId: item.activityId,
                                id: item.id,
                                rent: item.rent
                            };
                        })
                }
            });
            toast.add({ severity: 'success', summary: 'Berhasil', detail: `Data invoice berhasil ${props.edit ? 'diubah' : 'ditambah'}`, life: 3000 });
            router.push({ name: 'invoice' });
        } else {
            scrolltoError('.text-red-500');
        }
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Opps!', detail: ResponseMessage.message(error), life: 3000 });
    }
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

const handleDelete = () => {
    emmit('handleDelete', dataTobeDeleted.value);
};

defineExpose({ generateDataBon, formRef, selectedOptions, deleteModal });
</script>

<template>
    <div class="flex justify-center items-center">
        <div class="w-full">
            <div class="card">
                <span>Tekan <span class="font-bold text-primary">Ctl + K</span> untuk membuat lebih banyak</span>
            </div>
            <div class="card">
                <div class="grid grid-cols-1">
                    <CustomInputGroup type="text" placeholder="Masukan Nomor Invoice" label="Nomor Invoice" v-model="formRef.number" :invalid="!!getError('number')" :error-message="getError('number')" class-name="mb-8" />
                </div>
            </div>
            <h6 class="font-semibold text-xl mb-2">INVOICE TAMBAHAN</h6>
            <div class="card relative" v-for="(bon, i) in formRef.invoiceAdditionals" :key="i">
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-8">
                        <CustomInputGroup
                            label="Nomor BAP"
                            :error-message="getErros('invoiceAdditionals', 'bapNumber', i)"
                            :name="`bapNumber[${[i]}]`"
                            :invalid="!!getErros('invoiceAdditionals', 'bapNumber', i)"
                            v-model="bon.bapNumber"
                            type="text"
                            placeholder="Nomor BAP"
                            class="w-full"
                        />
                        <CustomInputGroup
                            label="Amount"
                            :error-message="getErros('invoiceAdditionals', 'amount', i)"
                            :name="`amount[${[i]}]`"
                            :invalid="!!getErros('invoiceAdditionals', 'amount', i)"
                            v-model="bon.amount"
                            type="number"
                            placeholder="Amount"
                            class="w-full"
                        />
                    </div>
                    <div class="flex flex-col gap-8">
                        <CustomSelectGroup
                            @valueChange="(value: any) => handleSelectOption(i, value)"
                            :editable="true"
                            label="Pilih Aktifitas"
                            :options="availableOptions(i)"
                            option-label="name"
                            option-value="id"
                            :error-message="getErros('invoiceAdditionals', 'activityId', i)"
                            :name="`activity[${[i]}]`"
                            :invalid="!!getErros('invoiceAdditionals', 'activityId', i)"
                            v-model="bon.activityId"
                            type="text"
                            placeholder="Kegiatan"
                            class="w-full"
                        />
                        <div class="flex items-center gap-2">
                            <Checkbox binary :inputId="`rent${i}`" v-model="formRef.invoiceAdditionals[i].rent" />
                            <label :for="`rent${i}`">Sewa</label>
                        </div>
                    </div>
                </div>
                <div class="w-10 h-10 rounded-full bg-primary text-white flex justify-center items-center absolute top-[-10px] right-[-5px] cursor-pointer" @click="handlePlusMinusBon(i, bon)" :class="i == 0 ? 'bg-primary' : 'bg-red-500'">
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
            <span>Apakah kamu yakin ingin menghapus data <span class="font-bold">(Data di dalam database akan ikut terhapus)</span>?</span>

            <template #footer>
                <Button label="Yes" icon="pi pi-check" text @click="handleDelete" />
            </template>
        </Dialog>
    </div>
</template>
