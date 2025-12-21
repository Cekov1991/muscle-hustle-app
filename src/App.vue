<template>
  <ion-app :class="{ 'gym-branded': isBrandingInitialized }">
    <ion-router-outlet />
    
    <!-- Global loading state -->
    <ion-loading
      :is-open="isInitializing"
      message="Loading..."
      spinner="crescent"
    />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet, IonLoading } from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { useAuth } from './features/auth/composables/useAuth'
import { useBranding } from './shared/composables/useBranding'

export default {
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    IonLoading
  },
  setup() {
    const { isInitialized } = useAuth()
    const { isInitialized: isBrandingInitialized } = useBranding()
    const isInitializing = ref(true)
    
    onMounted(() => {
      // Wait for auth to initialize, then hide loading
      const checkInitialized = () => {
        if (isInitialized.value) {
          isInitializing.value = false
        } else {
          setTimeout(checkInitialized, 100)
        }
      }
      checkInitialized()
    })
    
    // Global error handler
    const handleGlobalError = (error) => {
      console.error('Global app error:', error)
    }
    
    // Set up global error handling
    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      handleGlobalError(event.reason)
    })
    
    return {
      isInitializing,
      isBrandingInitialized
    }
  }
}
</script>

<style>
/* Global app styles */
#app {
  height: 100vh;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--ion-color-medium);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ion-color-dark);
}
</style>
