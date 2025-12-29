<template>
  <div v-if="!dismissed" class="tip-card">
    <div class="tip-content">
      <div class="tip-header">
        <h4 class="tip-title">{{ title }}</h4>
        <button class="dismiss-button" @click="dismiss" aria-label="Dismiss tip">
          <ion-icon :icon="closeOutline" />
        </button>
      </div>
      <p class="tip-text">
        <slot>{{ text }}</slot>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { IonIcon } from '@ionic/vue'
import { closeOutline } from 'ionicons/icons'

export default {
  name: 'ExerciseTipCard',
  components: {
    IonIcon
  },
  props: {
    title: {
      type: String,
      default: 'Tip'
    },
    text: {
      type: String,
      default: ''
    },
    storageKey: {
      type: String,
      default: null
    },
    persistent: {
      type: Boolean,
      default: false
    }
  },
  emits: ['dismiss'],
  setup(props, { emit }) {
    const dismissed = ref(false)
    
    // Check if tip was previously dismissed
    onMounted(() => {
      if (props.storageKey && props.persistent) {
        const wasDismissed = localStorage.getItem(`tip_dismissed_${props.storageKey}`)
        if (wasDismissed === 'true') {
          dismissed.value = true
        }
      }
    })
    
    const dismiss = () => {
      dismissed.value = true
      
      // Persist dismissal if configured
      if (props.storageKey && props.persistent) {
        localStorage.setItem(`tip_dismissed_${props.storageKey}`, 'true')
      }
      
      emit('dismiss')
    }
    
    return {
      dismissed,
      dismiss,
      closeOutline
    }
  }
}
</script>

<style scoped>
.tip-card {
  background: var(--brand-card-background-color, #f8f9fa);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
}

.tip-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.tip-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-primary-color);
  margin: 0;
  letter-spacing: -0.3px;
}

.dismiss-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--brand-gray-20, #e5e7eb);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.dismiss-button:hover {
  background: var(--brand-gray-30, #d1d5db);
}

.dismiss-button:active {
  transform: scale(0.95);
}

.dismiss-button ion-icon {
  font-size: 16px;
  color: var(--brand-gray-50, #6b7280);
}

.tip-text {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0;
  line-height: 1.5;
  letter-spacing: -0.2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tip-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }
  
  .dismiss-button {
    background: var(--brand-gray-30, #374151);
  }
  
  .dismiss-button:hover {
    background: var(--brand-gray-40, #4b5563);
  }
}
</style>

