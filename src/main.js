import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store' // Store
import { initRouter } from './router/index.js' // Router
import language from './locales' // 国际化
import '@styles/core/tailwind.css' // tailwind
import '@styles/index.scss' // 样式
import '@utils/sys/console.js' // 控制台输出内容
import { setupGlobDirectives } from './directives'
import { initMonitor } from './config/monitor' // 前端监控

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
initStore(app)
initRouter(app)
setupGlobDirectives(app)
initMonitor(app)

app.use(language)
app.mount('#app')
// test comment