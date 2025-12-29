import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Demo from './demo.vue'

// Mock global config for demo environment
window.getGlobalConfig = (key) => {
    if (key === 'g_g6_topo_animate') return true;
    return null;
}

const app = createApp(Demo)

app.use(ElementPlus)

app.mount('#app')
