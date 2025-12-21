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
import { ref, onMounted, watch } from 'vue'
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
    
    // Watch for auth initialization instead of polling
    watch(isInitialized, (initialized) => {
      if (initialized) {
        isInitializing.value = false
      }
    }, { immediate: true })
    
    onMounted(() => {
      // If auth is already initialized on mount, hide loading immediately
      if (isInitialized.value) {
        isInitializing.value = false
      }
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
