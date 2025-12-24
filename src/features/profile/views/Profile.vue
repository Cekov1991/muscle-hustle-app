<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen>
      <!-- Loading State -->
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
        <!-- Profile Header -->
        <div class="profile-header">
          <ProfilePhotoUpload 
            :current-photo="profile?.profile_photo"
            :loading="saving"
            @photo-updated="handlePhotoUpdate"
          />
        </div>

        <!-- Tabbed Interface -->
        <ion-segment v-model="activeTab" class="profile-tabs">
          <ion-segment-button value="account">
            <ion-icon :icon="personOutline"></ion-icon>
            <ion-label>Account</ion-label>
          </ion-segment-button>
          <ion-segment-button value="fitness">
            <ion-icon :icon="fitnessOutline"></ion-icon>
            <ion-label>Fitness</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Account Info Tab -->
          <AccountInfo 
            v-show="activeTab === 'account'"
            :profile="profile"
            :loading="saving"
            @update="handleAccountUpdate"
          />

          <!-- Fitness Profile Tab -->
          <FitnessProfile 
            v-show="activeTab === 'fitness'"
            :profile="profile"
            :loading="saving"
            @update="handleFitnessUpdate"
          />
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
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/vue'
import {
  alertCircleOutline,
  refreshOutline,
  personOutline,
  fitnessOutline
} from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import { useProfile } from '../composables/useProfile'
import { useToast } from '../../../shared/composables/useToast'
import AccountInfo from '../components/AccountInfo.vue'
import FitnessProfile from '../components/FitnessProfile.vue'
import ProfilePhotoUpload from '../components/ProfilePhotoUpload.vue'

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
    IonSegment,
    IonSegmentButton,
    IonLabel,
    AccountInfo,
    FitnessProfile,
    ProfilePhotoUpload
  },
  setup() {
    const { showSuccess, showError } = useToast()
    const {
      profile,
      loading,
      error,
      saving,
      fetchProfile,
      updateProfile,
      clearError
    } = useProfile()

    // Local state
    const activeTab = ref('account')

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

    // Handle account info update
    const handleAccountUpdate = async (accountData) => {
      try {
        await updateProfile(accountData)
        await showSuccess('Account information updated successfully')
      } catch (error) {
        console.error('Failed to update account:', error)
        
        if (error.response?.status === 422) {
          // Validation errors - let the component handle them
          throw error
        }
        
        await showError(error.message || 'Failed to update account information')
      }
    }

    // Handle fitness profile update
    const handleFitnessUpdate = async (fitnessData) => {
      try {
        await updateProfile(fitnessData)
        await showSuccess('Fitness profile updated successfully')
      } catch (error) {
        console.error('Failed to update fitness profile:', error)
        
        if (error.response?.status === 422) {
          // Validation errors - let the component handle them
          throw error
        }
        
        await showError(error.message || 'Failed to update fitness profile')
      }
    }

    // Handle photo update
    const handlePhotoUpdate = async () => {
      await showSuccess('Profile photo updated successfully')
    }

    return {
      // State
      profile,
      loading,
      error,
      saving,
      activeTab,
      
      // Methods
      handleRetry,
      handleAccountUpdate,
      handleFitnessUpdate,
      handlePhotoUpdate,
      
      // Icons
      alertCircleOutline,
      refreshOutline,
      personOutline,
      fitnessOutline
    }
  }
}
</script>

<style scoped>
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

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: var(--brand-background-color, #fafafa);
  border-bottom: 1px solid var(--ion-color-light-shade);
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

.profile-tabs {
  margin: 0;
  --background: var(--brand-background-color);
}

.tab-content {
  padding: 0;
}

/* Ensure consistent styling with existing components */
ion-segment-button {
  --color: var(--brand-gray-40);
  --color-checked: var(--brand-primary);
  --indicator-color: var(--brand-primary);
}
</style>
