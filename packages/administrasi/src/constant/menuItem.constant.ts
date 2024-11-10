export const menuItem: Array<{
    label: string,
    items: Array<{ label: string, icon: string, to: string }>,
    separator?: string
}> = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Setting',
            items: [
                { label: 'General', icon: 'pi pi-cog', to: '/setting/general' },
                { label: 'Pajak', icon: 'pi pi-money-bill', to: '/setting/tax' },
                {
                    label: 'Pengguna',
                    icon: 'pi pi-fw pi-book',
                    to: '/user'
                },
                {
                    label: 'Role',
                    icon: 'pi pi-key',
                    to: '/role'
                },
            ],

        },
        {
            label: 'Master Data',
            items: [
                {
                    label: 'Aktifitas',
                    icon: 'pi pi-calendar',
                    to: '/activity'
                },
                {
                    label: 'Pekerja',
                    icon: 'pi pi-th-large',
                    to: '/employee'
                },
                {
                    label: 'Perusahaan',
                    icon: 'pi pi-server',
                    to: '/company'
                },
            ]
        },
        {
            label: "Transaksi",
            items: [
                {
                    label: 'Hasil Kerja Anggota',
                    icon: 'pi pi-stopwatch',
                    to: '/member-work-result'
                },
                {
                    label: 'Invoice',
                    icon: 'pi pi-link',
                    to: '/invoice'
                },
                {
                    label: 'Tambah Hasil Kerja Anggota',
                    icon: 'pi pi-stop-circle',
                    to: '/member-work-result/form'
                },
                {
                    label: 'Tambah Invoice',
                    icon: 'pi pi-stop-circle',
                    to: '/invoice/form'
                },
            ]
        },
        {
            label: 'Akutansi',
            items: [{ label: 'Laba Rugi', icon: 'pi pi-percentage', to: '/accounting' }]
        },
    ]
