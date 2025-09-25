import './assets/main.css'
import vuetify from './plugins/vuetify'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
  .use(vuetify)
  .mount('#app')
