import doRequest from '@/helpers/do-request.helper'
import { defineStore } from 'pinia'

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useProfileStore = defineStore('profile', {
    state: () => ({
        loading: false,
        data: {},
        default: localStorage.getItem('company') || null
    }) as {
        loading: boolean,
        data: {
            id: string,
            username: string,
            email: string,
            role: {
                access: string[],
                companies: Record<string, any>[],
                name: string
            }
        },
        default: any
    },
    actions: {
        async getData() {
            console.log('starting')
            this.loading = true;
            const profileData = await doRequest({
                method: "get",
                url: "/auth/profile",
            });
            this.loading = false;
            this.data = profileData.data
        },
        changeDefault(value: any) {
            localStorage.setItem('company', value)
        }
    }
})
