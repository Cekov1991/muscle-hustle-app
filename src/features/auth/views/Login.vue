<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Fitness App</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen class="ion-padding">
      <div class="login-container">
        <div class="login-header">
          <ion-icon 
            :icon="fitnessOutline" 
            class="app-icon"
          />
          <h1>Welcome Back</h1>
          <p>Sign in to your fitness account</p>
        </div>

        <ion-card class="login-card">
          <ion-card-content>
            <form @submit.prevent="handleLogin">
              <ion-item 
                :class="{ 'ion-invalid': hasFieldError('email') }" 
                fill="outline"
                class="login-input"
              >
                <ion-label position="stacked">Email</ion-label>
                <ion-input
                  v-model="formData.email"
                  type="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  :disabled="isLoading"
                  @ion-blur="handleEmailBlur"
                  @ion-input="clearEmailError"
                />
                <ion-note v-if="getFieldError('email')" slot="error" color="danger">
                  {{ getFieldError('email') }}
                </ion-note>
              </ion-item>
              
              <ion-item 
                :class="{ 'ion-invalid': hasFieldError('password') }" 
                fill="outline"
                class="login-input"
              >
                <ion-label position="stacked">Password</ion-label>
                <ion-input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  :disabled="isLoading"
                  @ion-blur="handlePasswordBlur"
                  @ion-input="clearPasswordError"
                />
                <ion-button
                  fill="clear"
                  slot="end"
                  @click="togglePasswordVisibility"
                  :disabled="isLoading"
                >
                  <ion-icon 
                    :icon="showPassword ? eyeOffOutline : eyeOutline" 
                    slot="icon-only"
                  />
                </ion-button>
                <ion-note v-if="getFieldError('password')" slot="error" color="danger">
                  {{ getFieldError('password') }}
                </ion-note>
              </ion-item>

              <ion-button
                expand="block"
                type="submit"
                :disabled="isLoading || !isFormValid"
                class="login-button"
              >
                <ion-spinner v-if="isLoading" name="crescent" slot="start" />
                {{ isLoading ? 'Signing in...' : 'Sign In' }}
              </ion-button>
            </form>

            <!-- Demo credentials info -->
            <div class="demo-info">
              <ion-text color="medium">
                <p><small>Demo credentials for testing:</small></p>
                <p><small>Email: demo@example.com</small></p>
                <p><small>Password: password123</small></p>
              </ion-text>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonSpinner,
  IonNote,
  IonText
} from '@ionic/vue'
import { 
  eyeOutline, 
  eyeOffOutline, 
  fitnessOutline 
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../../../shared/composables/useToast'
import { useFormValidation } from '../../../shared/composables/useFormValidation'
import { useAsyncAction } from '../../../shared/composables/useAsyncAction'

export default {
  name: 'LoginView',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonNote,
    IonText
  },
  setup() {
    const router = useRouter()
    const { login } = useAuth()
    const { showSuccess } = useToast()
    
    // Form validation setup
    const validationRules = {
      email: ['required', 'email'],
      password: ['required', { type: 'minLength', value: 6 }]
    }
    
    const {
      formData,
      isFormValid,
      validateField,
      validateForm,
      touchField,
      getFieldError,
      hasFieldError,
      initializeForm
    } = useFormValidation(validationRules)
    
    // Async login action
    const {
      loading: isLoading,
      execute: executeLogin
    } = useAsyncAction(
      async (credentials) => {
        const result = await login(credentials)
        await showSuccess('Login successful! Welcome back.')
        router.replace('/tabs/dashboard')
        return result
      },
      {
        throwOnError: true // Let component handle the error display
      }
    )
    
    // UI state
    const showPassword = ref(false)
    
    // Initialize form
    onMounted(() => {
      initializeForm({
        email: { value: '' },
        password: { value: '' }
      })
    })
    
    // Event handlers
    const clearEmailError = () => {
      if (hasFieldError('email')) {
        formData.email = formData.email // Trigger reactivity
      }
    }
    
    const clearPasswordError = () => {
      if (hasFieldError('password')) {
        formData.password = formData.password // Trigger reactivity
      }
    }
    
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }
    
    const handleEmailBlur = () => {
      touchField('email')
      validateField('email')
    }
    
    const handlePasswordBlur = () => {
      touchField('password')
      validateField('password')
    }
    
    const handleLogin = async () => {
      // Touch all fields and validate
      touchField('email')
      touchField('password')
      
      if (!validateForm()) {
        return
      }
      
      try {
        await executeLogin({
          email: formData.email.trim(),
          password: formData.password
        })
      } catch (error) {
        console.error('Login failed:', error)
        // Error is already displayed by useApiError
      }
    }
    
    return {
      // Form data and validation
      formData,
      isFormValid,
      getFieldError,
      hasFieldError,
      
      // UI state
      isLoading,
      showPassword,
      
      // Event handlers
      clearEmailError,
      clearPasswordError,
      togglePasswordVisibility,
      handleEmailBlur,
      handlePasswordBlur,
      handleLogin,
      
      // Icons
      eyeOutline,
      eyeOffOutline,
      fitnessOutline
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px 0;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-icon {
  font-size: 4rem;
  color: var(--ion-color-primary);
  margin-bottom: 1rem;
}

.login-header h1 {
  color: var(--ion-color-dark);
  margin: 0.5rem 0;
}

.login-header p {
  color: var(--ion-color-medium);
  margin: 0;
}

.login-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.login-input {
  margin-bottom: 1rem;
}

.login-input ion-input {
  --padding-start: 16px;
  --padding-end: 16px;
}

.login-button {
  margin-top: 1.5rem;
  height: 48px;
  font-weight: 600;
}

.demo-info {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
  text-align: center;
}

.demo-info p {
  margin: 0.25rem 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  
  .app-icon {
    font-size: 3rem;
  }
}

/* Focus and error states */
.login-input.ion-invalid {
  --border-color: var(--ion-color-danger);
}

.login-input ion-item.item-has-focus {
  --border-color: var(--ion-color-primary);
}
</style>
