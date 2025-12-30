<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ modalTitle }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="metrics-modal-content">
      <div class="metric-detail-container" v-if="selectedMetric">
        <!-- Strength Score Details -->
        <template v-if="selectedMetric.type === 'strengthScore'">
          <div class="detail-header">
            <div class="detail-icon">
              <ion-icon :icon="barbellOutline" />
            </div>
            <div class="detail-main">
              <h2 class="detail-value">{{ selectedMetric.data.current }}</h2>
              <p class="detail-label">Strength Score</p>
            </div>
            <div class="detail-badge">
              <span class="level-badge" :class="getLevelClass(selectedMetric.data.level)">
                {{ selectedMetric.data.level }}
              </span>
            </div>
          </div>
          
          <div class="detail-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <ion-icon :icon="trendingUpOutline" />
              </div>
              <div class="stat-info">
                <p class="stat-value">+{{ selectedMetric.data.recentGain }}</p>
                <p class="stat-label">Recent Gain</p>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <ion-icon :icon="timeOutline" />
              </div>
              <div class="stat-info">
                <p class="stat-value">Last 30 days</p>
                <p class="stat-label">Gain Period</p>
              </div>
            </div>
          </div>
          
          <div class="detail-description">
            <p>Your strength score is calculated based on your workout performance, progressive overload, and consistency. Keep pushing your limits to reach the next level!</p>
          </div>
        </template>

        <!-- Strength Balance Details -->
        <template v-if="selectedMetric.type === 'strengthBalance'">
          <div class="detail-header">
            <div class="detail-icon">
              <ion-icon :icon="analyticsOutline" />
            </div>
            <div class="detail-main">
              <h2 class="detail-value">{{ selectedMetric.data.percentage }}%</h2>
              <p class="detail-label">Strength Balance</p>
            </div>
            <div class="detail-badge">
              <span class="level-badge" :class="getLevelClass(selectedMetric.data.level)">
                {{ selectedMetric.data.level }}
              </span>
            </div>
          </div>
          
          <div class="detail-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <ion-icon :icon="statsChartOutline" />
              </div>
              <div class="stat-info">
                <p class="stat-value">{{ selectedMetric.data.recentChange >= 0 ? '+' : '' }}{{ selectedMetric.data.recentChange }}%</p>
                <p class="stat-label">Recent Change</p>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <ion-icon :icon="bodyOutline" />
              </div>
              <div class="stat-info">
                <p class="stat-value">All Groups</p>
                <p class="stat-label">Muscle Balance</p>
              </div>
            </div>
          </div>
          
          <div class="detail-description">
            <p>Strength balance measures how evenly you're developing different muscle groups. A balanced approach reduces injury risk and improves overall performance.</p>
          </div>
        </template>

        <!-- Weekly Progress Details -->
        <template v-if="selectedMetric.type === 'weeklyProgress'">
          <div class="detail-header">
            <div class="detail-icon">
              <ion-icon :icon="trendingUpOutline" />
            </div>
            <div class="detail-main">
              <h2 class="detail-value">{{ selectedMetric.data.percentage >= 0 ? '+' : '' }}{{ selectedMetric.data.percentage }}%</h2>
              <p class="detail-label">Weekly Progress</p>
            </div>
            <div class="detail-badge">
              <span class="trend-badge" :class="getTrendClass(selectedMetric.data.trend)">
                {{ selectedMetric.data.trend.toUpperCase() }}
              </span>
            </div>
          </div>
          
          <div class="detail-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <ion-icon :icon="fitnessOutline" />
              </div>
              <div class="stat-info">
                <p class="stat-value">{{ additionalData?.currentWeekWorkouts || 0 }}</p>
                <p class="stat-label">This Week</p>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <ion-icon :icon="calendarOutline" />
              </div>
              <div class="stat-info">
                <p class="stat-value">{{ additionalData?.previousWeekWorkouts || 0 }}</p>
                <p class="stat-label">Previous Week</p>
              </div>
            </div>
          </div>
          
          <div class="detail-description">
            <p>Weekly progress compares your current week's performance with the previous week. {{ selectedMetric.data.trend === 'up' ? 'Great work! Keep the momentum going.' : 'Don\'t worry, consistency is key. Every week is a new opportunity!' }}</p>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script>
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent
} from '@ionic/vue'
import {
  closeOutline,
  barbellOutline,
  analyticsOutline,
  trendingUpOutline,
  timeOutline,
  statsChartOutline,
  bodyOutline,
  fitnessOutline,
  calendarOutline
} from 'ionicons/icons'
import { computed } from 'vue'

export default {
  name: 'MetricsDetailModal',
  components: {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    selectedMetric: {
      type: Object,
      default: null
    },
    additionalData: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const handleClose = () => {
      emit('close')
    }

    const modalTitle = computed(() => {
      if (!props.selectedMetric) return ''
      
      switch (props.selectedMetric.type) {
        case 'strengthScore':
          return 'Strength Score Details'
        case 'strengthBalance':
          return 'Strength Balance Details'
        case 'weeklyProgress':
          return 'Weekly Progress Details'
        default:
          return 'Metrics Details'
      }
    })

    const getLevelClass = (level) => {
      const lowerLevel = level?.toLowerCase()
      return {
        'level-beginner': lowerLevel === 'beginner',
        'level-intermediate': lowerLevel === 'intermediate', 
        'level-advanced': lowerLevel === 'advanced',
        'level-expert': lowerLevel === 'expert',
        'level-good': lowerLevel === 'good',
        'level-fair': lowerLevel === 'fair',
        'level-poor': lowerLevel === 'poor'
      }
    }

    const getTrendClass = (trend) => {
      return {
        'trend-up': trend === 'up',
        'trend-down': trend === 'down',
        'trend-stable': trend === 'stable'
      }
    }

    return {
      handleClose,
      modalTitle,
      getLevelClass,
      getTrendClass,
      // Icons
      closeOutline,
      barbellOutline,
      analyticsOutline,
      trendingUpOutline,
      timeOutline,
      statsChartOutline,
      bodyOutline,
      fitnessOutline,
      calendarOutline
    }
  }
}
</script>

<style scoped>
.metrics-modal-content {
  --padding: 20px;
}

.metric-detail-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--brand-card-background-color, var(--brand-gray-10));
  border-radius: 20px;
}

.detail-icon {
  width: 48px;
  height: 48px;
  background: var(--brand-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.detail-main {
  flex: 1;
}

.detail-value {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: 32px;
  color: var(--brand-text-primary-color);
  margin: 0;
  line-height: 1;
}

.detail-label {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  color: var(--brand-gray-50);
  margin: 4px 0 0 0;
}

.detail-badge {
  display: flex;
  align-items: center;
}

.level-badge, .trend-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-beginner { background: #FEF3C7; color: #92400E; }
.level-intermediate { background: #DBEAFE; color: #1E40AF; }
.level-advanced { background: #D1FAE5; color: #065F46; }
.level-expert { background: #F3E8FF; color: #6B21A8; }
.level-good { background: #D1FAE5; color: #065F46; }
.level-fair { background: #FED7AA; color: #C2410C; }
.level-poor { background: #FECACA; color: #B91C1C; }

.trend-up { background: #D1FAE5; color: #065F46; }
.trend-down { background: #FECACA; color: #B91C1C; }
.trend-stable { background: #F3F4F6; color: #374151; }

.detail-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--brand-card-background-color, var(--brand-gray-10));
  border-radius: 16px;
}

.stat-icon {
  width: 32px;
  height: 32px;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
  font-size: 18px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-lg);
  color: var(--brand-text-primary-color);
  margin: 0;
  line-height: 1;
}

.stat-label {
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-gray-50);
  margin: 4px 0 0 0;
}

.detail-description {
  padding: 20px;
  background: var(--brand-card-background-color, var(--brand-gray-10));
  border-radius: 16px;
}

.detail-description p {
  font-family: var(--brand-font-family);
  font-weight: 400;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  line-height: 1.5;
  margin: 0;
}
</style>
