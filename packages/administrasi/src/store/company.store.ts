import doRequest from '@/helpers/do-request.helper'
import { defineStore } from 'pinia'

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useCompanyStore = defineStore('company', {
    state: () => ({
        loading: false,
        data: [],
        default: localStorage.getItem('company') || null
    }) as {
        loading: boolean,
        data: {
            address: string,
            createdAt: string,
            email: string,
            id: string,
            name: string,
            phone: string,
            updatedAt: string
        }[],
        default: string | null
    },
    actions: {
        async getData() {
            this.loading = true;
            const companyData = await doRequest({
                method: "get",
                url: "/company",
                params: {
                    page: 1,
                    limit: 1000
                }
            });
            this.loading = false;
            this.data = companyData.data.result
        },
        changeDefault(value: any) {
            localStorage.setItem('company', value)
        }
    }
})
