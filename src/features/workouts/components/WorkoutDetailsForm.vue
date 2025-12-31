<template>
  <form @submit.prevent="handleSubmit" class="form-container">
    <!-- Plan Selector -->
    <div class="field-card">
      <PlanSelector
        :model-value="modelValue.plan_id"
        @update:model-value="updateField('plan_id', $event)"
        :required="!isEditMode"
        :disabled="loading"
        class="form-item"
      />
    </div>

    <!-- Workout Name -->
    <div class="field-card">
      <ion-item lines="none" class="form-item">
        <ion-label position="stacked">Workout Name *</ion-label>
        <ion-input
          :model-value="modelValue.name"
          @ion-input="updateField('name', $event.target.value)"
          placeholder="e.g., Push Day"
          :disabled="loading"
          required
        ></ion-input>
      </ion-item>
    </div>

    <!-- Description -->
    <div class="field-card">
      <ion-item lines="none" class="form-item">
        <ion-label position="stacked">Description</ion-label>
        <ion-textarea
          :model-value="modelValue.description"
          @ion-input="updateField('description', $event.target.value)"
          placeholder="Optional description"
          rows="3"
          :disabled="loading"
        ></ion-textarea>
      </ion-item>
    </div>

    <!-- Day of Week -->
    <div class="field-card">
      <ion-item lines="none" class="form-item">
        <ion-label position="stacked">Day of Week</ion-label>
        <ion-select
          :model-value="modelValue.day_of_week"
          @ion-change="updateField('day_of_week', $event.detail.value)"
          placeholder="Select day (optional)"
          :disabled="loading"
        >
          <ion-select-option :value="null">None</ion-select-option>
          <ion-select-option :value="0">Sunday</ion-select-option>
          <ion-select-option :value="1">Monday</ion-select-option>
          <ion-select-option :value="2">Tuesday</ion-select-option>
          <ion-select-option :value="3">Wednesday</ion-select-option>
          <ion-select-option :value="4">Thursday</ion-select-option>
          <ion-select-option :value="5">Friday</ion-select-option>
          <ion-select-option :value="6">Saturday</ion-select-option>
        </ion-select>
      </ion-item>
    </div>

    <!-- Action Buttons -->
    <div class="form-actions">
      <ion-button
        expand="block"
        type="submit"
        :disabled="loading || !isValid"
        class="save-button"
      >
        <ion-spinner v-if="loading" name="crescent" slot="start" />
        <ion-icon v-else :icon="checkmarkOutline" slot="start" />
        {{ isEditMode ? 'Update' : 'Create' }} Workout
      </ion-button>
      
      <ion-button
        expand="block"
        fill="outline"
        @click="$emit('cancel')"
        :disabled="loading"
        class="cancel-button"
      >
        <span class="button-text">Cancel</span>
      </ion-button>
    </div>
  </form>
</template>

<script>
import {
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import {
  checkmarkOutline
} from 'ionicons/icons'
import PlanSelector from './PlanSelector.vue'

export default {
  name: 'WorkoutDetailsForm',
  components: {
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonSpinner,
    PlanSelector
  },
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    isValid: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'submit', 'cancel'],
  setup(props, { emit }) {
    const updateField = (field, value) => {
      const updatedValue = { ...props.modelValue, [field]: value }
      emit('update:modelValue', updatedValue)
    }

    const handleSubmit = () => {
      if (props.isValid) {
        emit('submit')
      }
    }

    return {
      updateField,
      handleSubmit,
      checkmarkOutline
    }
  }
}
</script>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 0 auto;
}

.field-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-item {
  --background: transparent;
  --border-color: transparent;
  --inner-padding-start: 6px;
  --inner-padding-end: 16px;
  --inner-padding-top: 6px;
  --inner-padding-bottom: 6px;
  --min-height: auto;
}

.form-item ion-label {
  font-family: var(--brand-font-family);
  color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}

.form-item ion-input,
.form-item ion-textarea,
.form-item ion-select {
  font-family: var(--brand-font-family);
  --color: var(--brand-text-primary-color);
  --placeholder-color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-size: var(--brand-font-size-base);
  font-weight: 600;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-button {
  --background: var(--brand-primary);
  --background-hover: var(--brand-primary-shade);
  --color: var(--brand-text-on-primary-color);
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  border-radius: var(--brand-button-border-radius, 16px);
  height: 48px;
  letter-spacing: -0.3px;
}

.cancel-button {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  border-radius: var(--brand-button-border-radius, 16px);
  height: 48px;
  letter-spacing: -0.3px;
}

.save-button:disabled {
  --background: var(--brand-card-background-color, var(--brand-gray-10));
  --color: var(--brand-gray-50, var(--brand-text-secondary-color));
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .field-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }
}
</style>
