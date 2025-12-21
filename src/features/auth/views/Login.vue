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
                :class="{ 'ion-invalid': emailError }" 
                fill="outline"
                class="login-input"
              >
                <ion-label position="stacked">Email</ion-label>
                <ion-input
                  v-model="form.email"
                  type="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  :disabled="isLoading"
                  @ion-blur="validateEmail"
                  @ion-input="clearEmailError"
                />
                <ion-note v-if="emailError" slot="error" color="danger">
                  {{ emailError }}
                </ion-note>
              </ion-item>
              
              <ion-item 
                :class="{ 'ion-invalid': passwordError }" 
                fill="outline"
                class="login-input"
              >
                <ion-label position="stacked">Password</ion-label>
                <ion-input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  :disabled="isLoading"
                  @ion-blur="validatePassword"
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
                <ion-note v-if="passwordError" slot="error" color="danger">
                  {{ passwordError }}
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../../../shared/composables/useToast'

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
    const { showSuccess, showError } = useToast()
    
    // Form state
    const form = reactive({
      email: '',
      password: ''
    })
    
    // UI state
    const isLoading = ref(false)
    const showPassword = ref(false)
    const emailError = ref('')
    const passwordError = ref('')
    
    // Validation
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }
    
    const validateEmail = () => {
      if (!form.email) {
        emailError.value = 'Email is required'
        return false
      }
      if (!isValidEmail(form.email)) {
        emailError.value = 'Please enter a valid email'
        return false
      }
      emailError.value = ''
      return true
    }
    
    const validatePassword = () => {
      if (!form.password) {
        passwordError.value = 'Password is required'
        return false
      }
      if (form.password.length < 6) {
        passwordError.value = 'Password must be at least 6 characters'
        return false
      }
      passwordError.value = ''
      return true
    }
    
    const isFormValid = computed(() => {
      return form.email && 
             form.password && 
             !emailError.value && 
             !passwordError.value &&
             isValidEmail(form.email)
    })
    
    // Event handlers
    const clearEmailError = () => {
      emailError.value = ''
    }
    
    const clearPasswordError = () => {
      passwordError.value = ''
    }
    
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }
    
    const handleLogin = async () => {
      // Validate form
      const isEmailValid = validateEmail()
      const isPasswordValid = validatePassword()
      
      if (!isEmailValid || !isPasswordValid) {
        return
      }
      
      isLoading.value = true
      
      try {
        await login({
          email: form.email.trim(),
          password: form.password
        })
        
        await showSuccess('Login successful! Welcome back.')
        
        // Navigate to dashboard
        router.replace('/tabs/dashboard')
      } catch (error) {
        console.error('Login failed:', error)
        await showError(error.message)
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      form,
      isLoading,
      showPassword,
      emailError,
      passwordError,
      isFormValid,
      validateEmail,
      validatePassword,
      clearEmailError,
      clearPasswordError,
      togglePasswordVisibility,
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
