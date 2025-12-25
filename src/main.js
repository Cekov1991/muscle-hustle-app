import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import { IonicVue } from '@ionic/vue'

// Configure axios defaults for ngrok
// This header bypasses ngrok's browser warning page
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css'

/* Theme variables */
import './theme/variables.css'
import './theme/branding.css'
import './theme/common.css'

// Create Vue app
const app = createApp(App)
  .use(IonicVue, {
    rippleEffect: true,
    mode: 'md' // Use Material Design mode for consistent cross-platform look
  })
  .use(router)

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue error:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
}

// Development config
if (import.meta.env.DEV) {
  app.config.performance = true
  // Safely set up Vue DevTools if available
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app
  }
}

// Wait for router to be ready before mounting
router.isReady().then(() => {
  app.mount('#app')
})
