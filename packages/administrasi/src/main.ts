import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import App from './App.vue'
import router from './router'
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';


const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options:{
            darkModeSelector:'.app-dark'
        }
    },
    ptOptions: {
        mergeSections: true,
        mergeProps: false
    },
    ripple:true,
    inputVariant:"filled"
});

app.use(ToastService);
app.use(ConfirmationService);

app.use(createPinia())
app.use(router)

app.mount('#app')
