<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <!-- Loading State -->
      <div class="container">
        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading profile...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
          <h3>Unable to load profile</h3>
          <p>{{ error.message || 'Something went wrong' }}</p>
          <ion-button @click="handleRetry" fill="outline">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Try Again
          </ion-button>
        </div>

        <!-- Profile Content -->
        <div v-else class="profile-container">
          <!-- Profile Form -->
          <AccountInfo :profile="profile" :loading="saving" @update="handleProfileUpdate" />
          
          <!-- Logout Section -->
          <div class="logout-section">
            <ion-button 
              expand="block" 
              color="danger" 
              fill="outline"
              @click="handleLogout"
              :disabled="loggingOut"
            >
              <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
              {{ loggingOut ? 'Logging out...' : 'Log Out' }}
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonIcon,
  IonButton
} from '@ionic/vue'
import {
  alertCircleOutline,
  refreshOutline,
  logOutOutline
} from 'ionicons/icons'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfile } from '../composables/useProfile'
import { useAuth } from '../../auth/composables/useAuth'
import { useToast } from '../../../shared/composables/useToast'
import AccountInfo from '../components/AccountInfo.vue'

export default {
  name: 'ProfileView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonIcon,
    IonButton,
    AccountInfo
  },
  setup() {
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    const { logout } = useAuth()
    const loggingOut = ref(false)
    
    const {
      profile,
      loading,
      error,
      saving,
      fetchProfile,
      updateProfile,
      clearError
    } = useProfile()

    // Fetch profile on mount
    onMounted(async () => {
      try {
        await fetchProfile()
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    })

    // Handle retry
    const handleRetry = async () => {
      clearError()
      try {
        await fetchProfile()
      } catch (error) {
        console.error('Retry failed:', error)
      }
    }

    // Handle profile update (combined account and fitness)
    const handleProfileUpdate = async (profileData) => {
      try {
        await updateProfile(profileData)
        await showSuccess('Profile updated successfully')
      } catch (error) {
        console.error('Failed to update profile:', error)

        if (error.response?.status === 422) {
          // Validation errors - let the component handle them
          throw error
        }

        await showError(error.message || 'Failed to update profile')
      }
    }

    // Handle logout
    const handleLogout = async () => {
      loggingOut.value = true
      try {
        await logout()
        router.replace({ name: 'Login' })
      } catch (error) {
        console.error('Logout failed:', error)
        await showError('Failed to log out. Please try again.')
      } finally {
        loggingOut.value = false
      }
    }

    return {
      // State
      profile,
      loading,
      error,
      saving,
      loggingOut,

      // Methods
      handleRetry,
      handleProfileUpdate,
      handleLogout,

      // Icons
      alertCircleOutline,
      refreshOutline,
      logOutOutline
    }
  }
}
</script>

<style scoped>
ion-header {
  --background: var(--brand-background-color, #ffffff);
}

ion-toolbar {
  --background: var(--brand-background-color, #ffffff);
  --color: var(--brand-primary);
}

ion-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-lg);
  letter-spacing: -0.5px;
  color: var(--brand-primary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  gap: 16px;
}

.error-icon {
  font-size: 48px;
  color: var(--ion-color-danger);
}

.profile-container {
  padding: 0;
}

.profile-info {
  text-align: center;
  margin-top: 16px;
}

.profile-info h2 {
  margin: 0 0 4px 0;
  font-family: var(--brand-font-family);
  color: var(--brand-text-primary);
}

.profile-info p {
  margin: 0;
  color: var(--brand-text-secondary);
  font-size: 14px;
}

.logout-section {
  padding: 24px 16px;
  margin-top: 24px;
  border-top: 1px solid var(--ion-color-light-shade, #e0e0e0);
}

.logout-section ion-button {
  --border-radius: 8px;
  font-weight: 600;
}
</style>
