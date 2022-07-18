import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import mitt from 'mitt'

const app = createApp(App)
const emitter = mitt()
app.config.globalProperties.emitter = emitter

app.use(ElementPlus)
app.mount('#app')
