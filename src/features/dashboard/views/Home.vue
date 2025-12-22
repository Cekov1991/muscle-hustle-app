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
      <div class="workouts-card">
        <div class="card-header">
          <div class="title-section">
            <div class="icon-badge">
              <img src="/assets/ulpift-logo.png" alt="Icon" class="badge-icon" />
            </div>
            <h2 class="card-title">Performed Workouts</h2>
          </div>
        </div>

       
        <div class="chart-container">
          <div class="chart-wrapper">
           
            <div class="y-axis">
              <span class="y-label">60</span>
              <span class="y-label">45</span>
              <span class="y-label">30</span>
              <span class="y-label">15</span>
              <span class="y-label">0</span>
            </div>

           
            <div class="bars-container">
              <div 
                v-for="(workout, index) in workoutLengths" 
                :key="index"
                class="bar-wrapper"
              >
                <div 
                  class="bar"
                  :class="{ 'highest': workout.minutes === maxWorkoutLength }"
                  :style="{ height: `${(workout.minutes / maxWorkoutLength) * 100}%` }"
                >
      
                </div>
              </div>
            </div>
          </div>

         
          <div class="day-labels">
            <span v-for="(workout, index) in workoutLengths" :key="index" class="day-label">
              {{ workout.day }}
            </span>
          </div>
        </div>
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
import { ref, computed } from 'vue'
import { useAuth } from '../../auth/composables/useAuth'

export default {
  name: 'HomeView',
  components: {
    IonPage,
    IonContent,
    IonIcon
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
    
    // Workout lengths in minutes (mock data)
    const workoutLengths = ref([
      { day: 'Mon', minutes: 45 },
      { day: 'Tue', minutes: 60 }, // Longest workout
      { day: 'Wed', minutes: 50 },
      { day: 'Thu', minutes: 30 },
      { day: 'Fri', minutes: 55 },
      { day: 'Sat', minutes: 40 },
      { day: 'Sun', minutes: 35 }
    ])
    
    // Calculate max workout length for chart scaling
    const maxWorkoutLength = computed(() => {
      return Math.max(...workoutLengths.value.map(w => w.minutes))
    })
    
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
      workoutLengths,
      maxWorkoutLength,
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


/* Performed Workouts Card */
.workouts-card {
  background: var(--brand-gray-10, var(--brand-card-background-color));
  border-radius: 30px;
  padding: 12px;
  margin-bottom: 16px;
  margin-top: 5%; /* Overlap with header */
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-badge {
  width: 19px;
  height: 19px;
  background: var(--brand-primary);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.badge-icon {
  width: 15px;
  height: 15px;
  object-fit: contain;
}

.card-title {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xl);
  color: var(--brand-text-primary-color);
  margin: 0;
  letter-spacing: -0.7px;
}

/* Chart Container */
.chart-container {
  position: relative;
  padding: 0 24px 8px 0;
}

.chart-wrapper {
  display: flex;
  position: relative;
  height: 18vh;
  margin-bottom: 8px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  height: 100%;
  min-width: 25px;
}

.y-label {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xs);
  color: var(--brand-gray-30, var(--brand-text-tertiary-color));
  letter-spacing: -0.42px;
}

.bars-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  height: 100%;
  position: relative;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.bar {
  width: 10px;
  background: var(--brand-gray-20, var(--brand-border-color));
  border-radius: 2px;
  position: relative;
  transition: all 0.3s ease;
  min-height: 4px;
}

.bar.highest {
  background: var(--brand-text-primary-color);
}

.workout-badge {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--brand-primary);
  color: var(--brand-text-on-primary-color);
  padding: 4px 8px;
  border-radius: 8px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  white-space: nowrap;
  letter-spacing: -0.88px;
}

.day-labels {
  display: flex;
  justify-content: space-around;
  padding-left: 25px;
  gap: 8px;
}

.day-label {
  flex: 1;
  text-align: center;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xs);
  color: var(--brand-gray-40);
  letter-spacing: 0.06px;
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