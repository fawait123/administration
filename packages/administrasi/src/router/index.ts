import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/layout/AppLayout.vue'),
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/dashboard/index.vue')
                }
            ],
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/',
            component: () => import('@/layout/AppLayout.vue'),
            children: [
                {
                    path: '/user',
                    name: 'user',
                    component: () => import('@/views/user/index.vue')
                },
                {
                    path: '/role',
                    name: 'role',
                    component: () => import('@/views/role/index.vue')
                },
                {
                    path: '/activity',
                    name: 'activity',
                    component: () => import('@/views/activity/index.vue')
                },
                {
                    path: '/employee',
                    name: 'employee',
                    component: () => import('@/views/employee/index.vue')
                },
                {
                    path: '/company',
                    name: 'company',
                    component: () => import('@/views/company/index.vue')
                },
                {
                    path: '/',
                    children: [
                        {
                            path: '/member-work-result',
                            name: 'member-work-result',
                            component: () => import('@/views/member-work/index.vue')
                        },
                        {
                            path: '/member-work-result/detail/:id',
                            name: 'member-work-result-detail',
                            component: () => import('@/views/member-work/detail.vue')
                        },
                        {
                            path: '/member-work-result/form',
                            name: 'member-work-result-form',
                            component: () => import('@/views/member-work/form.vue')
                        },
                        {
                            path: '/member-work-result/edit/:id',
                            name: 'member-work-result-edit',
                            component: () => import('@/views/member-work/edit.vue')
                        }
                    ]
                },
                {
                    path: '/',
                    children: [
                        {
                            path: '/invoice',
                            name: 'invoice',
                            component: () => import('@/views/invoice/index.vue')
                        },
                        {
                            path: '/invoice/detail/:id',
                            name: 'invoice-detail',
                            component: () => import('@/views/invoice/detail.vue')
                        },
                        {
                            path: '/invoice/edit/:id',
                            name: 'invoice-edit',
                            component: () => import('@/views/invoice/edit.vue')
                        },
                        {
                            path: '/invoice/form',
                            name: 'invoice-form',
                            component: () => import('@/views/invoice/form.vue')
                        }
                    ]
                },
                {
                    path: '/',
                    children: [
                        {
                            path: '/setting/general',
                            name: 'setting-general',
                            component: () => import('@/views/setting/General.vue')
                        },
                        {
                            path: '/setting/tax',
                            name: 'setting-tax',
                            component: () => import('@/views/setting/Tax.vue')
                        }
                    ]
                },
                {
                    path: '/',
                    children: [
                        {
                            path: '/accounting',
                            name: 'accounting',
                            component: () => import('@/views/accounting/index.vue')
                        },
                        {
                            path: '/accounting/:id',
                            name: 'accounting-detail',
                            component: () => import('@/views/accounting/detail.vue')
                        }
                    ]
                }
            ],
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/login",
            name: "login",
            component: () => import('@/views/login/index.vue')
        },
        {
            path: "/error",
            name: "error",
            component: () => import('@/views/error/index.vue')
        },
        {
            path: "/not-found",
            name: "notfound",
            component: () => import('@/views/notfound/index.vue')
        }
    ]
})

router.beforeEach((to, from) => {
    if (to.meta.requiresAuth && !checkIsLogin()) {
        return {
            name: "login"
        }
    }

    if (!to.meta.requiresAuth && checkIsLogin()) {
        return {
            name: "dashboard"
        }
    }

    return true;
})

const checkIsLogin = () => {
    const token = localStorage.getItem('token')

    return token ? true : false
}
export default router
