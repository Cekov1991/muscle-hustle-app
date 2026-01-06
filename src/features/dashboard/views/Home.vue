<template>
  <ion-page class="fitness-assessment">
    <ion-content class="dashboard-content">

      <!-- Profile Header Section -->
      <div class="profile-header">
        <div class="header-background">
          <div class="bg-image" :style="backgroundImage"></div>
          <div class="bg-overlay"></div>
        </div>
        <div class="profile-content">
          <div class="profile-picture">
            <div class="partner-logo" :style="partnerLogoStyle"></div>
          </div>
          <div class="profile-info">
            <h1 class="partner-name">{{ partnerName || appName }}</h1>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Weekly Calendar Component -->
        <div class="calendar-wrapper">
          <WeeklyCalendar :workouts="sessions" :loading="calendarLoading" :error="calendarError"
            @retry="handleCalendarRetry" @dayClick="handleCalendarDayClick" />
        </div>


        <div class="metrics-container">
          <!-- Loading State -->
          <template v-if="metricsLoading">
            <div class="metric-card loading-state">
              <div class="loading-content">
                <ion-spinner name="crescent" class="metrics-spinner"></ion-spinner>
                <div class="loading-text">Loading...</div>
              </div>
            </div>
            <div class="metric-card loading-state">
              <div class="loading-content">
                <ion-spinner name="crescent" class="metrics-spinner"></ion-spinner>
                <div class="loading-text">Loading...</div>
              </div>
            </div>
            <div class="metric-card loading-state">
              <div class="loading-content">
                <ion-spinner name="crescent" class="metrics-spinner"></ion-spinner>
                <div class="loading-text">Loading...</div>
              </div>
            </div>
          </template>

          <!-- Error State -->
          <template v-else-if="metricsError">
            <div class="metric-card error-state">
              <div class="error-content">
                <p class="error-text">Failed to load metrics</p>
                <ion-button fill="outline" size="small" class="retry-button" @click="handleMetricsRetry">
                  Retry
                </ion-button>
              </div>
            </div>
          </template>

          <!-- Metrics Content -->
          <template v-else-if="metrics">
            <div class="metric-card clickable" @click="showMetricDetail('strengthScore')">
              <div class="metric-icon">
                <ion-icon :icon="barbellOutline" />
              </div>
              <div class="metric-value">{{ metrics.strengthScore?.current || 0 }}</div>
              <div class="metric-label">Strength Score</div>
              <div class="click-indicator">
                <ion-icon :icon="chevronForwardOutline" />
              </div>
            </div>

            <div class="metric-card clickable" @click="showMetricDetail('strengthBalance')">
              <div class="metric-icon">
                <ion-icon :icon="analyticsOutline" />
              </div>
              <div class="metric-value">{{ metrics.strengthBalance?.percentage || 0 }}%</div>
              <div class="metric-label">Strength Balance</div>
              <div class="click-indicator">
                <ion-icon :icon="chevronForwardOutline" />
              </div>
            </div>

            <div class="metric-card clickable" @click="showMetricDetail('weeklyProgress')">
              <div class="metric-icon">
                <ion-icon :icon="trendingUpOutline" />
              </div>
              <div class="metric-value">+{{ metrics.weeklyProgress?.percentage || 0 }}%</div>
              <div class="metric-label">Weekly Progress</div>
              <div class="click-indicator">
                <ion-icon :icon="chevronForwardOutline" />
              </div>
            </div>
          </template>

          <!-- No Metrics Available -->
          <template v-else>
            <div class="metric-card">
              <div class="metric-icon">
                <ion-icon :icon="barbellOutline" />
              </div>
              <div class="metric-value">-</div>
              <div class="metric-label">Strength Score</div>
            </div>

            <div class="metric-card">
              <div class="metric-icon">
                <ion-icon :icon="analyticsOutline" />
              </div>
              <div class="metric-value">-%</div>
              <div class="metric-label">Strength Balance</div>
            </div>

            <div class="metric-card">
              <div class="metric-icon">
                <ion-icon :icon="trendingUpOutline" />
              </div>
              <div class="metric-value">-% </div>
              <div class="metric-label">Weekly Progress</div>
            </div>
          </template>
        </div>

        <!-- Metrics Detail Modal -->
        <MetricsDetailModal :is-open="showMetricsModal" :selected-metric="selectedMetricData" :additional-data="{
          currentWeekWorkouts: metrics?.weeklyProgress?.currentWeekWorkouts || 0,
          previousWeekWorkouts: metrics?.weeklyProgress?.previousWeekWorkouts || 0
        }" @close="closeMetricsModal" />

        <button class="start-workout-button" :disabled="startingWorkout" @click="handleStartWorkout">
          <ion-spinner v-if="startingWorkout" name="crescent" class="button-spinner" />
          <span v-else
            style="font-size: var(--brand-font-size-base); font-weight: 600; color: var(--brand-text-on-primary-color);">
            {{ workoutButtonText }}
          </span>
        </button>
        
        <!-- Template Picker Modal -->
        <TemplatePickerModal 
          :is-open="showTemplatePicker" 
          @close="showTemplatePicker = false"
          @select="handleTemplateSelect"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
  IonButton
} from '@ionic/vue'
import {
  barbellOutline,
  analyticsOutline,
  trendingUpOutline,
  playOutline,
  chevronForwardOutline
} from 'ionicons/icons'
import { ref, computed, onMounted, onActivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../auth/composables/useAuth'
import { useCalendar } from '../composables/useCalendar'
import { appConfig } from '../../../config/app'
import { useMetrics } from '../composables/useMetrics'
import { useWorkoutSession } from '../../workouts/composables/useWorkoutSession'
import WeeklyCalendar from '../components/WeeklyCalendar.vue'
import MetricsDetailModal from '../components/MetricsDetailModal.vue'
import TemplatePickerModal from '../../workouts/components/TemplatePickerModal.vue'


export default {
  name: 'HomeView',
  components: {
    IonPage,
    IonContent,
    IonIcon,
    IonSpinner,
    IonButton,
    WeeklyCalendar,
    MetricsDetailModal,
    TemplatePickerModal
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { user } = useAuth()

    const { sessions, loading: calendarLoading, error: calendarError, fetchCurrentWeek, retryFetch } = useCalendar()
    const { metrics, loading: metricsLoading, error: metricsError, fetchMetrics, retryFetch: retryMetrics } = useMetrics()
    const { fetchToday, startSession, hasActiveSession } = useWorkoutSession()

    // Modal state
    const showMetricsModal = ref(false)
    const selectedMetricData = ref(null)
    
    // Workout state
    const showTemplatePicker = ref(false)
    const startingWorkout = ref(false)

    const partnerName = computed(() => {
      return user.value?.partner?.name || null
    })

    const partnerLogoStyle = computed(() => {
      const logo = user.value?.partner?.visual_identity?.logo
      if (logo) {
        return {
          backgroundImage: `url(${logo})`
        }
      }
      // Fallback to default logo
      return {
        backgroundImage: `url(/assets/ulpift-logo.png)`
      }
    })

    const backgroundImage = computed(() => {
      const bgImage = user.value?.partner?.visual_identity?.background_image
      if (bgImage) {
        return {
          backgroundImage: `url(${bgImage})`
        }
      }
      // Fallback to CSS variable (default background)
      return {}
    })

    // Computed property for workout button text
    const workoutButtonText = computed(() => {
      return hasActiveSession.value ? 'Continue Workout' : 'Start Workout'
    })    

    // Handle calendar retry
    const handleCalendarRetry = async () => {
      try {
        await retryFetch()
      } catch (error) {
        console.error('Retry failed:', error)
      }
    }

    // Handle metrics retry
    const handleMetricsRetry = async () => {
      try {
        await retryMetrics()
      } catch (error) {
        console.error('Metrics retry failed:', error)
      }
    }

    // Handle metric card clicks
    const showMetricDetail = (type) => {
      if (!metrics.value) return

      selectedMetricData.value = {
        type,
        data: metrics.value[type]
      }
      showMetricsModal.value = true
    }

    const closeMetricsModal = () => {
      showMetricsModal.value = false
      selectedMetricData.value = null
    }

    // Fetch data on mount
    onMounted(async () => {
      try {
        await Promise.all([
          fetchCurrentWeek(),
          fetchMetrics(),
          fetchToday() // Check for active session on mount
        ])
      } catch (error) {
        console.error('Failed to load data on mount:', error)
      }
    })

    // Refresh calendar when component is activated (when navigating back to dashboard)
    onActivated(async () => {
      try {
        // Refresh calendar and today's data when returning to dashboard
        await Promise.all([
          fetchCurrentWeek(),
          fetchToday()
        ])
      } catch (error) {
        console.error('Failed to refresh data on activation:', error)
      }
    })

    // Also watch for route changes to refresh calendar when navigating to dashboard
    watch(() => route.name, async (newRouteName, oldRouteName) => {
      // Refresh calendar when navigating to dashboard from workout session
      if (newRouteName === 'Dashboard' && oldRouteName === 'WorkoutSession') {
        try {
          await Promise.all([
            fetchCurrentWeek(),
            fetchToday()
          ])
        } catch (error) {
          console.error('Failed to refresh data on route change:', error)
        }
      }
    })

    // Start workout handler
    const handleStartWorkout = async () => {
      startingWorkout.value = true
      
      try {
        const todayData = await fetchToday()
        
        if (todayData?.session) {
          // Resume existing session
          router.push(`/tabs/workout-session/${todayData.session.id}`)
        } else if (todayData?.template) {
          // Start from today's template
          const newSession = await startSession(todayData.template.id)
          router.push(`/tabs/workout-session/${newSession.id}`)
        } else {
          // No template scheduled - show picker
          showTemplatePicker.value = true
        }
      } catch (error) {
        console.error('Failed to start workout:', error)
      } finally {
        startingWorkout.value = false
      }
    }
    
    // Handle template selection from picker
    const handleTemplateSelect = async (templateId) => {
      showTemplatePicker.value = false
      startingWorkout.value = true
      
      try {
        const newSession = await startSession(templateId)
        router.push(`/tabs/workout-session/${newSession.id}`)
      } catch (error) {
        console.error('Failed to start workout from template:', error)
      } finally {
        startingWorkout.value = false
      }
    }

    // Handle calendar day click
    const handleCalendarDayClick = ({ sessionId }) => {
      if (sessionId) {
        router.push(`/tabs/workout-session/${sessionId}`)
      }
    }

    // App name from config (uses VITE_APP_NAME env var)
    const appName = appConfig.name

    return {
      user,
      partnerName,
      appName,
      partnerLogoStyle,
      backgroundImage,
      metrics,
      metricsLoading,
      metricsError,
      handleMetricsRetry,
      showMetricsModal,
      selectedMetricData,
      showMetricDetail,
      closeMetricsModal,
      sessions,
      calendarLoading,
      calendarError,
      handleCalendarRetry,
      handleStartWorkout,
      handleTemplateSelect,
      handleCalendarDayClick,
      showTemplatePicker,
      startingWorkout,
      workoutButtonText,
      // Icons
      barbellOutline,
      analyticsOutline,
      trendingUpOutline,
      playOutline,
      chevronForwardOutline
    }
  }
}
</script>

<style scoped>
.fitness-assessment {
  font-family: var(--brand-font-family);
  background: var(--brand-background-color, #fafafa);
}

.dashboard-content {
  --overflow: auto;
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
  border-radius: 0 0 40px 40px;
}

.bg-image {
  width: 100%;
  height: 100%;
  background-image: var(--brand-background-image-profile);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%);
  z-index: 1;
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

.profile-content>* {
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

.partner-logo {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.profile-info {
  text-align: center;
  position: relative;
  z-index: 4;
  padding: 8px 16px;
}

.partner-name {
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
  margin-top: 10%;
  /* Overlap with header */
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
  background: var(--brand-card-background-color, var(--brand-gray-10));
  border-radius: 20px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  position: relative;
  overflow: hidden;
}

.metric-card.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.metric-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.metric-card.clickable:active {
  transform: translateY(0);
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
  font-size: 23px;
  /* Unique size, keeping as is */
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
  transform: scale(1.01);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
}

.start-workout-button:active {
  transform: scale(0.95);
}

.start-workout-button ion-icon {
  font-size: var(--brand-font-size-4xl);
  color: var(--brand-text-on-primary-color);
  margin-left: 2px;
  /* Slight offset for play icon */
}

.start-workout-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-spinner {
  --color: var(--brand-text-on-primary-color);
  width: 24px;
  height: 24px;
}

/* Metrics Loading & Error States */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.metrics-spinner {
  --color: var(--brand-primary);
  width: 20px;
  height: 20px;
}

.loading-text {
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-xs);
  color: var(--brand-gray-40, var(--brand-text-tertiary-color));
  letter-spacing: -0.3px;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  grid-column: 1 / -1;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.error-text {
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-gray-50, var(--brand-text-secondary-color));
  margin: 0;
  letter-spacing: -0.3px;
}

.retry-button {
  --color: var(--brand-primary);
  --border-color: var(--brand-primary);
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xs);
  letter-spacing: -0.2px;
  min-height: 32px;
}

/* Click Indicator */
.click-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  color: var(--brand-gray-40, var(--brand-text-tertiary-color));
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.metric-card.clickable:hover .click-indicator {
  opacity: 1;
}

.metric-card.clickable .click-indicator {
  opacity: 0.6;
}
</style>