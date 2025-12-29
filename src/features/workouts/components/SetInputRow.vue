<template>
  <div class="set-row" :class="{ 'is-logged': isLogged, 'is-editing': isEditing }">
    <div class="set-header">
      <span class="set-number">Set {{ setNumber }}</span>
      <span v-if="isLogged" class="logged-badge">
        <ion-icon :icon="checkmarkCircle" />
        Logged
      </span>
    </div>
    
    <div class="set-inputs">
      <div class="input-group">
        <ion-input
          v-model.number="localWeight"
          type="number"
          inputmode="decimal"
          :placeholder="weightPlaceholder"
          :disabled="isLogged && !isEditing"
          class="weight-input"
          @ionFocus="handleFocus"
          @ionBlur="handleBlur"
        />
        <span class="input-unit">kg</span>
      </div>
      
      <span class="input-separator">x</span>
      
      <div class="input-group">
        <ion-input
          v-model.number="localReps"
          type="number"
          inputmode="numeric"
          :placeholder="repsPlaceholder"
          :disabled="isLogged && !isEditing"
          class="reps-input"
          @ionFocus="handleFocus"
          @ionBlur="handleBlur"
        />
        <span class="input-unit">reps</span>
      </div>
      
      <div class="action-buttons">
        <template v-if="!isLogged">
          <ion-button 
            fill="solid" 
            size="small" 
            class="log-button"
            :disabled="!canLog || loading"
            @click="handleLogSet"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Log</span>
          </ion-button>
        </template>
        
        <template v-else-if="isEditing">
          <ion-button 
            fill="solid" 
            size="small" 
            color="success"
            class="save-button"
            :disabled="loading"
            @click="handleSaveEdit"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <ion-icon v-else :icon="checkmark" />
          </ion-button>
          <ion-button 
            fill="clear" 
            size="small" 
            color="medium"
            class="cancel-button"
            @click="handleCancelEdit"
          >
            <ion-icon :icon="close" />
          </ion-button>
        </template>
        
        <template v-else-if="canEdit">
          <ion-button 
            fill="clear" 
            size="small" 
            color="medium"
            class="edit-button"
            @click="handleStartEdit"
          >
            <ion-icon :icon="pencil" />
          </ion-button>
          <ion-button 
            v-if="canDelete"
            fill="clear" 
            size="small" 
            color="danger"
            class="delete-button"
            :disabled="loading"
            @click="handleDelete"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <ion-icon v-else :icon="trashOutline" />
          </ion-button>
        </template>
      </div>
    </div>
    
    <!-- Previous performance hint -->
    <div v-if="previousSet && !isLogged" class="previous-hint">
      Previous: {{ previousSet.weight }}kg x {{ previousSet.reps }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { IonInput, IonButton, IonIcon, IonSpinner } from '@ionic/vue'
import { 
  checkmarkCircle, 
  checkmark, 
  close, 
  pencil, 
  trashOutline 
} from 'ionicons/icons'

export default {
  name: 'SetInputRow',
  components: {
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner
  },
  props: {
    setNumber: {
      type: Number,
      required: true
    },
    loggedSet: {
      type: Object,
      default: null
    },
    previousSet: {
      type: Object,
      default: null
    },
    targetWeight: {
      type: [Number, String],
      default: null
    },
    targetReps: {
      type: [Number, String],
      default: null
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['log', 'update', 'delete'],
  setup(props, { emit }) {
    const localWeight = ref(null)
    const localReps = ref(null)
    const isEditing = ref(false)
    const isFocused = ref(false)
    
    // Computed
    const isLogged = computed(() => !!props.loggedSet)
    
    const weightPlaceholder = computed(() => {
      if (props.previousSet) {
        return String(props.previousSet.weight)
      }
      if (props.targetWeight) {
        return String(props.targetWeight)
      }
      return '0'
    })
    
    const repsPlaceholder = computed(() => {
      if (props.previousSet) {
        return String(props.previousSet.reps)
      }
      if (props.targetReps) {
        return String(props.targetReps)
      }
      return '0'
    })
    
    const canLog = computed(() => {
      const weight = localWeight.value ?? parseFloat(weightPlaceholder.value)
      const reps = localReps.value ?? parseInt(repsPlaceholder.value)
      return weight > 0 && reps > 0
    })
    
    // Initialize values from logged set if exists
    watch(() => props.loggedSet, (newVal) => {
      if (newVal) {
        localWeight.value = parseFloat(newVal.weight)
        localReps.value = newVal.reps
      }
    }, { immediate: true })
    
    // Pre-fill with previous values for convenience
    watch(() => props.previousSet, (newVal) => {
      if (newVal && !props.loggedSet && localWeight.value === null) {
        localWeight.value = parseFloat(newVal.weight)
        localReps.value = newVal.reps
      }
    }, { immediate: true })
    
    // Methods
    const handleFocus = () => {
      isFocused.value = true
    }
    
    const handleBlur = () => {
      isFocused.value = false
    }
    
    const handleLogSet = () => {
      const weight = localWeight.value ?? parseFloat(weightPlaceholder.value)
      const reps = localReps.value ?? parseInt(repsPlaceholder.value)
      
      emit('log', {
        set_number: props.setNumber,
        weight,
        reps
      })
    }
    
    const handleStartEdit = () => {
      isEditing.value = true
    }
    
    const handleCancelEdit = () => {
      isEditing.value = false
      // Reset to logged values
      if (props.loggedSet) {
        localWeight.value = parseFloat(props.loggedSet.weight)
        localReps.value = props.loggedSet.reps
      }
    }
    
    const handleSaveEdit = () => {
      emit('update', {
        id: props.loggedSet.id,
        weight: localWeight.value,
        reps: localReps.value
      })
      isEditing.value = false
    }
    
    const handleDelete = () => {
      emit('delete', props.loggedSet.id)
    }
    
    return {
      localWeight,
      localReps,
      isEditing,
      isLogged,
      weightPlaceholder,
      repsPlaceholder,
      canLog,
      handleFocus,
      handleBlur,
      handleLogSet,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleDelete,
      // Icons
      checkmarkCircle,
      checkmark,
      close,
      pencil,
      trashOutline
    }
  }
}
</script>

<style scoped>
.set-row {
  background: var(--brand-card-background-color, var(--brand-gray-10));
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.set-row.is-logged {
  background: var(--brand-gray-5, rgba(0, 0, 0, 0.02));
  border: 1px solid var(--brand-gray-20, rgba(0, 0, 0, 0.08));
}

.set-row.is-editing {
  background: var(--brand-primary-light, rgba(249, 115, 22, 0.08));
  border: 1px solid var(--brand-primary);
}

.set-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.set-number {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
}

.logged-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-xs);
  color: var(--ion-color-success, #2dd36f);
}

.logged-badge ion-icon {
  font-size: 14px;
}

.set-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  background: var(--brand-background-color, #fff);
  border-radius: 8px;
  padding: 4px 8px;
  border: 1px solid var(--brand-gray-20, rgba(0, 0, 0, 0.1));
}

.weight-input,
.reps-input {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 4px;
  --padding-bottom: 4px;
  width: 50px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  text-align: center;
}

.input-unit {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  color: var(--brand-text-tertiary-color, var(--brand-gray-50));
  margin-left: 4px;
}

.input-separator {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-tertiary-color);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.log-button {
  --padding-start: 16px;
  --padding-end: 16px;
  --background: var(--brand-primary);
  --border-radius: 8px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  min-height: 36px;
}

.log-button ion-spinner {
  width: 16px;
  height: 16px;
}

.save-button,
.cancel-button,
.edit-button,
.delete-button {
  --padding-start: 8px;
  --padding-end: 8px;
  min-height: 32px;
}

.save-button ion-icon,
.cancel-button ion-icon,
.edit-button ion-icon,
.delete-button ion-icon {
  font-size: 18px;
}

.previous-hint {
  margin-top: 8px;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  color: var(--brand-gray-40, var(--brand-text-tertiary-color));
  letter-spacing: -0.2px;
}
</style>

