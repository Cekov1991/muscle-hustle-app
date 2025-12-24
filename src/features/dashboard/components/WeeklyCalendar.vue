<template>
  <div class="calendar-card">
    <div class="calendar-header">
      <h2 class="calendar-title">This Week</h2>
      <ion-icon :icon="calendarOutline" class="calendar-icon" />
    </div>
    
    <div class="calendar-content">
      <!-- Day abbreviations -->
      <div class="day-abbreviations">
        <span 
          v-for="day in currentWeek" 
          :key="day.dateStr + '-abbr'"
          class="day-abbr"
        >
          {{ day.dayAbbr }}
        </span>
      </div>
      
      <!-- Dates -->
      <div class="calendar-dates">
        <span 
          v-for="day in currentWeek" 
          :key="day.dateStr + '-date'"
          class="date-number"
        >
          {{ day.dayNumber }}
        </span>
      </div>
      
      <!-- Activity indicators -->
      <div class="activity-indicators">
        <div 
          v-for="day in currentWeek" 
          :key="day.dateStr + '-indicator'"
          class="day-indicator-wrapper"
          @click="selectedDate = day.dateStr"
        >
          <div 
            class="day-circle"
            :class="{ 
              'selected': selectedDate === day.dateStr,
              'has-workout': day.hasWorkout
            }"
          >
            <ion-icon 
              v-if="day.hasWorkout" 
              :icon="checkmark" 
              class="checkmark-icon"
            />
          </div>
          <div 
            v-if="day.hasWorkout" 
            class="workout-dot"
          ></div>
        </div>
      </div>
      
      <!-- Empty state message -->
      <div v-if="!hasAnyWorkouts" class="empty-state">
        Nothing scheduled, yet!
      </div>
    </div>
  </div>
</template>

<script>
import { IonIcon } from '@ionic/vue'
import { calendarOutline, checkmark } from 'ionicons/icons'
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'WeeklyCalendar',
  components: {
    IonIcon
  },
  props: {
    workouts: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    
    // Generate current week's dates (Sunday to Saturday)
    const getCurrentWeek = () => {
      const today = new Date()
      const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - currentDay) // Start from Sunday
      
      const week = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
        
        // Check if this date has a workout
        const hasWorkout = props.workouts.some(workout => {
          const workoutDate = workout.date || workout.dateStr
          return workoutDate === dateStr && workout.completed !== false
        })
        
        week.push({
          date: date,
          dateStr: dateStr,
          dayAbbr: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
          dayNumber: date.getDate(),
          isToday: date.toDateString() === today.toDateString(),
          hasWorkout: hasWorkout
        })
      }
      return week
    }
    
    const currentWeek = ref(getCurrentWeek())
    
    // Check if any workouts exist in the week
    const hasAnyWorkouts = computed(() => {
      return currentWeek.value.some(day => day.hasWorkout)
    })
    
    // Watch for changes in workouts prop and regenerate week
    watch(() => props.workouts, () => {
      currentWeek.value = getCurrentWeek()
    }, { deep: true })
    
    // Regenerate week on mount to ensure fresh data
    onMounted(() => {
      currentWeek.value = getCurrentWeek()
    })
    
    return {
      currentWeek,
      selectedDate,
      hasAnyWorkouts,
      calendarOutline,
      checkmark
    }
  }
}
</script>

<style scoped>
/* Calendar Card */
.calendar-card {
  background: var(--brand-gray-10, var(--brand-card-background-color));
  border-radius: 30px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-title {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xl);
  color: var(--brand-text-primary-color);
  margin: 0;
  letter-spacing: -0.7px;
}

.calendar-icon {
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
}

.calendar-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-abbreviations {
  display: flex;
  justify-content: space-around;
  padding: 0 4px;
}

.day-abbr {
  flex: 1;
  text-align: center;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-primary-color);
}

.calendar-dates {
  display: flex;
  justify-content: space-around;
  padding: 0 4px;
}

.date-number {
  flex: 1;
  text-align: center;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-primary-color);
}

.activity-indicators {
  display: flex;
  justify-content: space-around;
  padding: 0 4px;
  position: relative;
}

.day-indicator-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.day-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--brand-gray-20, var(--brand-border-color));
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.day-circle.selected {
  border-color: var(--brand-primary);
  background: rgba(249, 115, 22, 0.1);
}

.day-circle.has-workout {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
}

.checkmark-icon {
  width: 18px;
  height: 18px;
  color: white;
}

.workout-dot {
  width: 6px;
  height: 6px;
  background: var(--brand-primary);
  border-radius: 50%;
  position: absolute;
  bottom: -8px;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-base);
  color: var(--brand-gray-40, var(--brand-text-tertiary-color));
  padding: 16px 0;
  letter-spacing: -0.5px;
}
</style>

