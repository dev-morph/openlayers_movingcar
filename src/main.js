import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router.js'
import '@/css/global.css'

const app = createApp(App)

app.use(router).mount('#app')
