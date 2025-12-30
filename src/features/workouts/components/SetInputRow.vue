<template>
  <div class="set-card" :class="{ 'is-logged': isLogged, 'is-editing': isEditing }">
    <div class="set-content">
      <!-- Set Label -->
      <div class="set-label">
        <span class="set-number">Set {{ setNumber }}</span>
        <span v-if="isLogged" class="logged-indicator">
          <ion-icon :icon="checkmarkCircle" />
        </span>
      </div>

      <!-- Inputs Container -->
      <div class="inputs-container">
        <!-- Reps Input -->
        <div class="input-box">
          <div class="input-wrapper" :class="{ 'has-value': localReps }">
            <ion-input
              :value="localReps"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :placeholder="repsPlaceholder"
              :disabled="isLogged && !isEditing"
              class="value-input"
              @ionInput="handleRepsInput"
              @ionFocus="handleFocus"
              @ionBlur="handleBlur"
            />
            <span class="input-unit">reps</span>
          </div>
          <div v-if="previousSet" class="last-value">
            <ion-icon :icon="timeOutline" />
            <span>Last: {{ previousSet.reps }} reps</span>
          </div>
        </div>

        <!-- Weight Input -->
        <div class="input-box">
          <div class="input-wrapper" :class="{ 'has-value': localWeight }">
            <ion-input
              :value="localWeight"
              type="text"
              inputmode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              :placeholder="weightPlaceholder"
              :disabled="isLogged && !isEditing"
              class="value-input"
              @ionInput="handleWeightInput"
              @ionFocus="handleFocus"
              @ionBlur="handleBlur"
            />
            <span class="input-unit">kg</span>
          </div>
          <div v-if="previousSet" class="last-value">
            <ion-icon :icon="timeOutline" />
            <span>Last: {{ previousSet.weight }} kg</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-row" v-if="showActions">
      <!-- Log Set Button (not logged yet) -->
      <template v-if="!isLogged">
        <button 
          class="log-button"
          :disabled="!canLog || loading"
          @click="handleLogSet"
        >
          <ion-spinner v-if="loading" name="crescent" />
          <span v-else class="button-text">Log Set</span>
        </button>
      </template>
      
      <!-- Editing Mode: Save & Cancel -->
      <template v-else-if="isEditing">
        <div class="edit-actions">
          <button 
            class="text-btn save-btn"
            :disabled="loading"
            @click="handleSaveEdit"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Save</span>
          </button>
          <button 
            class="text-btn cancel-btn"
            @click="handleCancelEdit"
          >
            Cancel
          </button>
        </div>
      </template>
      
      <!-- Logged: Edit & Delete -->
      <template v-else-if="canEdit">
        <div class="logged-actions">
          <button 
            class="text-btn edit-btn"
            @click="handleStartEdit"
          >
            Edit
          </button>
          <button 
            v-if="canDelete"
            class="text-btn delete-btn"
            :disabled="loading"
            @click="handleDelete"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Delete</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { IonInput, IonIcon, IonSpinner } from '@ionic/vue'
import { checkmarkCircle, timeOutline } from 'ionicons/icons'

export default {
  name: 'SetInputRow',
  components: {
    IonInput,
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
    
    const showActions = computed(() => {
      return isFocused.value || isEditing.value || !isLogged.value || props.canEdit
    })
    
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
    const handleRepsInput = (event) => {
      const value = event.detail.value
      if (value === '' || value === null) {
        localReps.value = null
      } else {
        const parsed = parseInt(value, 10)
        localReps.value = isNaN(parsed) ? null : parsed
      }
    }
    
    const handleWeightInput = (event) => {
      const value = event.detail.value
      if (value === '' || value === null) {
        localWeight.value = null
      } else {
        const parsed = parseFloat(value)
        localWeight.value = isNaN(parsed) ? null : parsed
      }
    }
    
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
      showActions,
      weightPlaceholder,
      repsPlaceholder,
      canLog,
      handleRepsInput,
      handleWeightInput,
      handleFocus,
      handleBlur,
      handleLogSet,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleDelete,
      // Icons
      checkmarkCircle,
      timeOutline
    }
  }
}
</script>

<style scoped>
.set-card {
  background: var(--brand-card-background-color, #f8f9fa);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.set-card.is-logged {
  background: var(--brand-gray-5, #f0f0f0);
}

.set-card.is-editing {
  background: var(--brand-primary-light, rgba(59, 130, 246, 0.08));
  box-shadow: 0 0 0 2px var(--brand-primary);
}

.set-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.set-label {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 60px;
  padding-top: 12px;
}

.set-number {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-lg);
  color: var(--brand-text-primary-color);
}

.logged-indicator {
  color: var(--ion-color-success, #2dd36f);
  font-size: 16px;
  display: flex;
  align-items: center;
}

.inputs-container {
  display: flex;
  gap: 12px;
  flex: 1;
}

.input-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--brand-background-color, #fff);
  border: 2px solid var(--brand-gray-20, #e5e7eb);
  border-radius: 12px;
  padding: 8px 12px;
  transition: border-color 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--brand-primary, #3b82f6);
}

.input-wrapper.has-value {
  border-color: var(--brand-gray-30, #d1d5db);
}

.value-input {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: 20px;
  text-align: center;
  flex: 1;
  min-width: 0;
}

.value-input::part(native) {
  text-align: center;
}

.input-unit {
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-gray-50, #6b7280);
  margin-left: 4px;
  white-space: nowrap;
}

.last-value {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  color: var(--brand-gray-40, #9ca3af);
  padding-left: 4px;
}

.last-value ion-icon {
  font-size: 12px;
}

.action-row {
  display: flex;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--brand-gray-10, rgba(0, 0, 0, 0.05));
}

/* Full-width Log Set button */
.log-button {
  width: 100%;
  padding: 14px 20px;
  background: var(--brand-primary);
  border: none;
  border-radius: 12px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-on-primary-color, #fff);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.log-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: scale(1.01);
}

.log-button:active:not(:disabled) {
  transform: scale(0.98);
}

.log-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.log-button ion-spinner {
  --color: var(--brand-text-on-primary-color, #fff);
  width: 18px;
  height: 18px;
}

/* Logged actions container (Edit & Delete) */
.logged-actions,
.edit-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
}

/* Text buttons */
.text-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.text-btn ion-spinner {
  width: 14px;
  height: 14px;
}

.text-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-btn:active:not(:disabled) {
  transform: scale(0.96);
}

/* Edit button */
.edit-btn {
  color: var(--brand-primary);
  background: var(--brand-primary-light, rgba(59, 130, 246, 0.1));
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.15);
}

/* Delete button */
.delete-btn {
  color: var(--ion-color-danger, #eb445a);
  background: rgba(235, 68, 90, 0.1);
}

.delete-btn:hover {
  background: rgba(235, 68, 90, 0.15);
}

/* Save button */
.save-btn {
  color: var(--ion-color-success, #2dd36f);
  background: rgba(45, 211, 111, 0.1);
}

.save-btn:hover {
  background: rgba(45, 211, 111, 0.15);
}

/* Cancel button */
.cancel-btn {
  color: var(--brand-gray-50, #6b7280);
  background: var(--brand-gray-10, rgba(0, 0, 0, 0.05));
}

.cancel-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .set-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }
  
  .set-card.is-logged {
    background: var(--brand-gray-5, #2a2a2a);
  }
  
  .input-wrapper {
    background: var(--brand-background-color, #121212);
    border-color: var(--brand-gray-30, #3f3f3f);
  }
}
</style>
