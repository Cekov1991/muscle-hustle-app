<template>
  <ion-modal 
    :is-open="isOpen" 
    :backdrop-dismiss="false"
    class="rest-timer-modal"
  >
    <div class="timer-container">
      <div class="timer-header">
        <h2 class="timer-title">Rest Timer</h2>
        <p class="timer-subtitle">{{ exerciseName }}</p>
      </div>
      
      <div class="timer-circle" :class="{ 'is-complete': isComplete }">
        <svg class="progress-ring" viewBox="0 0 200 200">
          <circle
            class="progress-ring-bg"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke-width="8"
          />
          <circle
            class="progress-ring-fill"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke-width="8"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
          />
        </svg>
        <div class="timer-display">
          <span class="timer-time">{{ formattedTime }}</span>
          <span class="timer-label">{{ isComplete ? 'Complete!' : 'remaining' }}</span>
        </div>
      </div>
      
      <div class="timer-info">
        <p class="next-set-info">Next: Set {{ nextSetNumber }}</p>
      </div>
      
      <div class="timer-actions">
        <ion-button 
          v-if="!isComplete"
          fill="outline" 
          color="medium"
          class="skip-button"
          @click="handleSkip"
        >
          Skip Rest
        </ion-button>
        <ion-button 
          v-else
          fill="solid" 
          class="continue-button"
          @click="handleContinue"
        >
          Continue
        </ion-button>
      </div>
      
      <div class="timer-controls">
        <ion-button 
          fill="clear" 
          size="small"
          color="medium"
          @click="addTime(-15)"
          :disabled="remainingSeconds <= 15"
        >
          -15s
        </ion-button>
        <ion-button 
          fill="clear" 
          size="small"
          color="medium"
          @click="addTime(15)"
        >
          +15s
        </ion-button>
      </div>
    </div>
  </ion-modal>
</template>

<script>
import { ref, computed, watch, onUnmounted } from 'vue'
import { IonModal, IonButton } from '@ionic/vue'

export default {
  name: 'RestTimerModal',
  components: {
    IonModal,
    IonButton
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 90 // seconds
    },
    exerciseName: {
      type: String,
      default: ''
    },
    nextSetNumber: {
      type: Number,
      default: 2
    }
  },
  emits: ['close', 'complete', 'skip'],
  setup(props, { emit }) {
    const remainingSeconds = ref(props.duration)
    const isComplete = ref(false)
    let timerInterval = null
    
    // Circle progress calculations
    const radius = 90
    const circumference = 2 * Math.PI * radius
    
    const strokeDashoffset = computed(() => {
      const progress = remainingSeconds.value / props.duration
      return circumference * (1 - progress)
    })
    
    const formattedTime = computed(() => {
      const mins = Math.floor(remainingSeconds.value / 60)
      const secs = remainingSeconds.value % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    })
    
    // Start timer when modal opens
    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        remainingSeconds.value = props.duration
        isComplete.value = false
        startTimer()
      } else {
        stopTimer()
      }
    })
    
    // Reset when duration changes
    watch(() => props.duration, (newVal) => {
      if (props.isOpen && !isComplete.value) {
        remainingSeconds.value = newVal
      }
    })
    
    const startTimer = () => {
      stopTimer() // Clear any existing timer
      timerInterval = setInterval(() => {
        if (remainingSeconds.value > 0) {
          remainingSeconds.value--
        } else {
          isComplete.value = true
          stopTimer()
          // Vibrate if available
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
          }
          emit('complete')
        }
      }, 1000)
    }
    
    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
    
    const addTime = (seconds) => {
      remainingSeconds.value = Math.max(0, remainingSeconds.value + seconds)
    }
    
    const handleSkip = () => {
      stopTimer()
      emit('skip')
      emit('close')
    }
    
    const handleContinue = () => {
      stopTimer()
      emit('close')
    }
    
    onUnmounted(() => {
      stopTimer()
    })
    
    return {
      remainingSeconds,
      isComplete,
      circumference,
      strokeDashoffset,
      formattedTime,
      addTime,
      handleSkip,
      handleContinue
    }
  }
}
</script>

<style scoped>
.rest-timer-modal {
  --background: transparent;
  --backdrop-opacity: 0.7;
}

.rest-timer-modal::part(content) {
  background: transparent;
  box-shadow: none;
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--brand-background-color, #fafafa);
}

.timer-header {
  text-align: center;
  margin-bottom: 32px;
}

.timer-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-2xl);
  color: var(--brand-text-primary-color);
  margin: 0 0 8px 0;
}

.timer-subtitle {
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  margin: 0;
}

.timer-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 24px;
}

.timer-circle.is-complete {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  stroke: var(--brand-gray-20, rgba(0, 0, 0, 0.1));
}

.progress-ring-fill {
  stroke: var(--brand-primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.timer-circle.is-complete .progress-ring-fill {
  stroke: var(--ion-color-success, #2dd36f);
}

.timer-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-time {
  display: block;
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: 48px;
  color: var(--brand-text-primary-color);
  line-height: 1;
}

.timer-circle.is-complete .timer-time {
  font-size: 24px;
  color: var(--ion-color-success, #2dd36f);
}

.timer-label {
  display: block;
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-tertiary-color);
  margin-top: 4px;
}

.timer-info {
  margin-bottom: 32px;
}

.next-set-info {
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  margin: 0;
}

.timer-actions {
  margin-bottom: 16px;
}

.skip-button {
  --border-radius: 12px;
  --padding-start: 32px;
  --padding-end: 32px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  min-height: 48px;
}

.continue-button {
  --background: var(--brand-primary);
  --border-radius: 12px;
  --padding-start: 32px;
  --padding-end: 32px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  min-height: 48px;
}

.timer-controls {
  display: flex;
  gap: 16px;
}

.timer-controls ion-button {
  font-family: var(--brand-font-family);
  font-weight: 500;
}
</style>

