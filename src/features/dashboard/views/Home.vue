<template>
  <ion-page class="fitness-assessment">
    <!-- Profile Header Section -->
    <div class="profile-header">
      <div class="header-background">
        <div class="bg-image"></div>
      </div>
      <div class="profile-content">
        <div class="profile-picture">
          <img src="/assets/profile-avatar.png" alt="Profile" class="avatar" />
        </div>
        <div class="profile-info">
          <h1 class="user-name">{{ user?.name || 'User' }}</h1>
          <div class="user-details">
            <span class="location">{{ userLocation }}</span>
            <span class="separator">•</span>
            <span class="fitness-level">{{ fitnessLevel }}</span>
          </div>
        </div>
      </div>
    </div>

    <ion-content class="dashboard-content">
     
      <div style="padding: 10px !important;">
        <!-- Weekly Calendar Component -->
        <div class="calendar-wrapper">
          <WeeklyCalendar :workouts="workoutsByDate" />
        </div>

      
        <div class="metrics-container">
          <div class="metric-card">
            <div class="metric-icon">
              <ion-icon :icon="personOutline" />
            </div>
            <div class="metric-value">{{ fitnessMetrics.age }}yr</div>
            <div class="metric-label">Current Age</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <ion-icon :icon="scaleOutline" />
            </div>
            <div class="metric-value">{{ fitnessMetrics.weight }}kg</div>
            <div class="metric-label">Weight</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              <ion-icon :icon="flameOutline" />
            </div>
            <div class="metric-value">{{ fitnessMetrics.caloriesBurned }} kcal</div>
            <div class="metric-label">Calories Burned</div>
          </div>
        </div>

        <button class="start-workout-button" @click="handleStartWorkout">
          <!-- <ion-icon :icon="playOutline" /> -->
          <span style="font-size: var(--brand-font-size-base); font-weight: 600; color: var(--brand-text-on-primary-color);">Start Workout</span>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonContent,
  IonIcon
} from '@ionic/vue'
import { 
  personOutline,
  scaleOutline,
  flameOutline,
  playOutline
} from 'ionicons/icons'
import { ref } from 'vue'
import { useAuth } from '../../auth/composables/useAuth'
import WeeklyCalendar from '../components/WeeklyCalendar.vue'

export default {
  name: 'HomeView',
  components: {
    IonPage,
    IonContent,
    IonIcon,
    WeeklyCalendar
  },
  setup() {
    const { user } = useAuth()
    
    // User data
    const userLocation = ref('Tokyo, Japan')
    const fitnessLevel = ref('Beginner') // Options: Beginner, Intermediate, Advanced, Expert
    
    // Fitness metrics (mock data)
    const fitnessMetrics = ref({
      age: 17,
      weight: 68,
      caloriesBurned: 978
    })
    
    // Generate mock workout data with actual dates for the current week
    const generateWorkoutsByDate = () => {
      const today = new Date()
      const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - currentDay) // Start from Sunday
      
      const workouts = []
      // Add workouts for Monday (index 1) and Wednesday (index 3) to match the image
      const monday = new Date(startOfWeek)
      monday.setDate(startOfWeek.getDate() + 1)
      workouts.push({ date: monday.toISOString().split('T')[0], completed: true })
      
      const wednesday = new Date(startOfWeek)
      wednesday.setDate(startOfWeek.getDate() + 3)
      workouts.push({ date: wednesday.toISOString().split('T')[0], completed: true })
      
      return workouts
    }
    
    const workoutsByDate = ref(generateWorkoutsByDate())
    
    // Start workout handler (placeholder)
    const handleStartWorkout = () => {
      console.log('Start workout clicked - functionality to be implemented')
      // TODO: Navigate to workout screen or start workout flow
    }
    
    return {
      user,
      userLocation,
      fitnessLevel,
      fitnessMetrics,
      workoutsByDate,
      handleStartWorkout,
      // Icons
      personOutline,
      scaleOutline,
      flameOutline,
      playOutline
    }
  }
}
</script>

<style scoped>
.fitness-assessment {
  font-family: var(--brand-font-family);
  background: var(--brand-background-color, #fafafa);
  min-height: 100vh;
}

/* Profile Header */
.profile-header {
  position: relative;
  height: 190px;
  border-radius: 40px 40px 0 0;
  overflow: visible;
  margin-bottom: 0;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 0 0 40px 40px ;
}

.bg-image {
  width: 100%;
  height: 100%;
  background-image: var(--brand-background-image-profile);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.profile-content {
  position: absolute;
  bottom: -1%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  pointer-events: none;
}

.profile-content > * {
  pointer-events: auto;
}

.profile-picture {
  width: 89px;
  height: 90px;
  border-radius: 30px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  text-align: center;
  position: relative;
  z-index: 4;
  padding: 8px 16px;
}

.user-name {
  font-family: var(--brand-font-family);
  color: var(--brand-text-on-primary-color);
  font-weight: 700;
  font-size: var(--brand-font-size-4xl);
  line-height: normal;
  margin: 0 0 8px 0;
  letter-spacing: -1.26px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-on-primary-color);
  letter-spacing: -0.72px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}


/* Calendar Wrapper */
.calendar-wrapper {
  margin-top: 10%; /* Overlap with header */
  position: relative;
  z-index: 2;
}

/* Metric Cards */
.metrics-container {
  display: flex;
  flex-direction: row;
  gap: 13px;
  margin-bottom: 32px;
}

.metric-card {
  flex: 1;
  background: var(--brand-gray-10, var(--brand-card-background-color));
  border-radius: 20px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.metric-icon {
  width: 24px;
  height: 24px;
  color: var(--brand-text-primary-color);
  margin-bottom: 4px;
}

.metric-icon ion-icon {
  font-size: 24px;
}

.metric-value {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-3xl);
  color: var(--brand-text-primary-color);
  line-height: 1;
  letter-spacing: -0.104px;
}

.metric-card:nth-child(2) .metric-value {
  font-size: var(--brand-font-size-3xl);
}

.metric-card:nth-child(3) .metric-value {
  font-size: 23px; /* Unique size, keeping as is */
  letter-spacing: -0.322px;
}

.metric-label {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-gray-50);
  letter-spacing: -0.896px;
}

/* Start Workout Button */
.start-workout-button {
  width: 100%;
  height: 63px;
  border-radius: var(--brand-button-border-radius);
  background: var(--brand-primary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  margin-bottom: 10%;
  transition: all 0.2s ease;
}

.start-workout-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
}

.start-workout-button:active {
  transform: scale(0.95);
}

.start-workout-button ion-icon {
  font-size: var(--brand-font-size-4xl);
  color: var(--brand-text-on-primary-color);
  margin-left: 2px; /* Slight offset for play icon */
}
</style>