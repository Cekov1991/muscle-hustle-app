<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Fitness Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout" fill="clear">
            <ion-icon :icon="logOutOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen class="ion-padding">
      <div class="dashboard-container">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="user-avatar">
            <ion-icon :icon="personOutline" />
          </div>
          <h1>Hello, {{ user?.name || 'User' }}!</h1>
          <p class="welcome-message">
            Welcome to your fitness dashboard. Ready to start your workout?
          </p>
        </div>

        <!-- Quick Stats Cards -->
        <div class="stats-grid">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon">
                <ion-icon :icon="trophyOutline" color="warning" />
              </div>
              <div class="stat-info">
                <h3>0</h3>
                <p>Workouts</p>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon">
                <ion-icon :icon="timeOutline" color="success" />
              </div>
              <div class="stat-info">
                <h3>0h</h3>
                <p>Total Time</p>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon">
                <ion-icon :icon="barbellOutline" color="primary" />
              </div>
              <div class="stat-info">
                <h3>0</h3>
                <p>Exercises</p>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Logout Section -->
        <div class="logout-section">
          <ion-card>
            <ion-card-content>
              <div class="logout-content">
                <div>
                  <h3>Account</h3>
                  <p>{{ user?.email || 'user@example.com' }}</p>
                </div>
                <ion-button 
                  fill="outline" 
                  color="danger" 
                  @click="handleLogout"
                  :disabled="isLoggingOut"
                >
                  <ion-spinner v-if="isLoggingOut" name="crescent" slot="start" />
                  <ion-icon v-else :icon="logOutOutline" slot="start" />
                  {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
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
  IonCard, 
  IonCardContent, 
  IonButton, 
  IonButtons,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import { 
  logOutOutline,
  personOutline,
  trophyOutline,
  timeOutline,
  barbellOutline
} from 'ionicons/icons'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../auth/composables/useAuth'
import { useToast } from '../../../shared/composables/useToast'

export default {
  name: 'HomeView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonSpinner
  },
  setup() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { showSuccess } = useToast()
    
    const isLoggingOut = ref(false)
    
    const handleLogout = async () => {
      isLoggingOut.value = true
      
      try {
        await logout()
        await showSuccess('Successfully signed out. See you next time!')
        router.replace('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Even if there's an error, still redirect to login
        router.replace('/login')
      } finally {
        isLoggingOut.value = false
      }
    }
    
    return {
      user,
      isLoggingOut,
      handleLogout,
      // Icons
      logOutOutline,
      personOutline,
      trophyOutline,
      timeOutline,
      barbellOutline
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 1rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.user-avatar ion-icon {
  font-size: 2.5rem;
  color: white;
}

.welcome-section h1 {
  color: var(--ion-color-dark);
  margin: 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.welcome-message {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card ion-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.stat-icon ion-icon {
  font-size: 2rem;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.stat-info p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

/* Logout Section */
.logout-section {
  margin-top: 2rem;
}

.logout-section ion-card {
  border-radius: 12px;
}

.logout-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.logout-content h3 {
  color: var(--ion-color-dark);
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.logout-content p {
  color: var(--ion-color-medium);
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 0;
  }
  
  .welcome-section {
    padding: 1rem;
  }
  
  .welcome-section h1 {
    font-size: 1.75rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .logout-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
