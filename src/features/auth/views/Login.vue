<template>
  <ion-page class="ulpift-login">
    <!-- Header with background image -->
    <div class="login-header-bg">
      <div class="header-gradient-overlay"></div>
      
      <!-- Logo and title section -->
      <div class="header-content">
        <div class="logo-container">
          <div class="logo-badge">
            <img src="/assets/ulpift-logo.png" alt="Ulpift Logo" class="logo" />
          </div>
        </div>
        <div class="header-text">
          <h1 class="main-title">Sign In To Ulpift</h1>
          <p class="subtitle">Let's personalize your fitness journey</p>
        </div>
      </div>
    </div>
    
    <ion-content class="login-content">
      <div class="form-container">
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email Input -->
          <div class="input-group">
            <label class="input-label">Email Address</label>
            <div class="input-wrapper" :class="{ 'focused': emailFocused, 'error': hasFieldError('email') }">
              <ion-icon :icon="mailOutline" class="input-icon" />
              <input
                v-model="formData.email"
                type="email"
                placeholder="elementary221b@gmail.co"
                class="custom-input"
                :disabled="isLoading"
                @focus="emailFocused = true"
                @blur="handleEmailBlur"
                @input="clearEmailError"
              />
            </div>
            <div v-if="getFieldError('email')" class="error-message">
              {{ getFieldError('email') }}
            </div>
          </div>

          <!-- Password Input -->
          <div class="input-group">
            <label class="input-label">Password</label>
            <div class="input-wrapper" :class="{ 'focused': passwordFocused, 'error': hasFieldError('password') }">
              <ion-icon :icon="lockClosedOutline" class="input-icon" />
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="***********"
                class="custom-input"
                :disabled="isLoading"
                @focus="passwordFocused = true"
                @blur="handlePasswordBlur"
                @input="clearPasswordError"
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePasswordVisibility"
                :disabled="isLoading"
              >
                <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
              </button>
            </div>
            <div v-if="getFieldError('password')" class="error-message">
              {{ getFieldError('password') }}
            </div>
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            class="signin-button"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="!isLoading">Sign In</span>
            <ion-spinner v-if="isLoading" name="crescent" class="button-spinner" />
            <ion-icon v-if="!isLoading" :icon="arrowForwardOutline" class="button-arrow" />
          </button>
        </form>
      </div>

      <!-- Home Indicator -->
      <div class="home-indicator"></div>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonContent, 
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import { 
  eyeOutline, 
  eyeOffOutline, 
  mailOutline,
  lockClosedOutline,
  arrowForwardOutline
} from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../../../shared/composables/useToast'
import { useFormValidation } from '../../../shared/composables/useFormValidation'
import { useAsyncAction } from '../../../shared/composables/useAsyncAction'
import { useApiError } from '../../../shared/composables/useApiError'

export default {
  name: 'LoginView',
  components: {
    IonPage,
    IonContent,
    IonIcon,
    IonSpinner
  },
  setup() {
    const router = useRouter()
    const { login } = useAuth()
    const { showSuccess, showError } = useToast()
    const { getValidationErrors, isValidationError } = useApiError()
    
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
      initializeForm,
      setFieldErrors
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
    const emailFocused = ref(false)
    const passwordFocused = ref(false)
    
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
        validateField('email')
      }
    }
    
    const clearPasswordError = () => {
      if (hasFieldError('password')) {
        validateField('password')
      }
    }
    
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }
    
    const handleEmailBlur = () => {
      emailFocused.value = false
      touchField('email')
      validateField('email')
    }
    
    const handlePasswordBlur = () => {
      passwordFocused.value = false
      touchField('password')
      validateField('password')
    }
    
    
    const handleLogin = async () => {
      // Clear any previous field errors to allow retry
      setFieldErrors({})
      
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
        
        // Check if this is a validation error (422) from backend
        if (isValidationError(error)) {
          const validationErrors = getValidationErrors(error)
          if (validationErrors) {
            // Only set field errors for actual validation issues (malformed data)
            // Not for authentication failures (wrong password, etc.)
            const isAuthError = error.response?.data?.message?.toLowerCase().includes('invalid') || 
                               error.response?.data?.message?.toLowerCase().includes('incorrect') ||
                               error.response?.data?.message?.toLowerCase().includes('wrong') ||
                               error.response?.status === 401
            
            if (!isAuthError) {
              // Set backend validation errors on form fields for data validation issues
              setFieldErrors(validationErrors)
              return // Don't show generic toast, field errors are now visible
            }
          }
        }
        
        // For authentication errors and other failures, show a toast notification
        // This allows the user to retry immediately without form being disabled
        const errorMessage = error.response?.data?.message || 
                             error.message || 
                             'Login failed. Please check your credentials and try again.'
        showError(errorMessage)
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
      emailFocused,
      passwordFocused,
      
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
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline
    }
  }
}
</script>

<style scoped>
.ulpift-login {
  font-family: var(--brand-font-family);
  background: var(--brand-background-color);
  overflow: hidden;
}

/* Mobile-first: rounded design for small screens */
@media (max-width: 768px) {
  .ulpift-login {
    border-radius: 40px;
  }
}

/* Desktop: full-width design */
@media (min-width: 769px) {
  .ulpift-login {
    border-radius: 0;
    min-height: 100vh;
  }
}

/* Header Background Section */
.login-header-bg {
  position: relative;
  background-image: var(--brand-background-image-login);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

/* Mobile: fixed height */
@media (max-width: 768px) {
  .login-header-bg {
    height: 256px;
  }
}

/* Desktop: larger header for better proportions */
@media (min-width: 769px) {
  .login-header-bg {
    height: 40vh;
    min-height: 300px;
  }
}

.header-gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--brand-background-color) 100%);
}

/* Header Content */
.header-content {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 2;
}

.logo-container {
  display: flex;
  justify-content: center;
}

.logo-badge {
  background: var(--brand-primary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.logo {
  object-fit: contain;
}

/* Mobile: original size */
@media (max-width: 768px) {
  .logo-badge {
    width: 63px;
    height: 63px;
  }
  
  .logo {
    width: 47px;
    height: 47px;
  }
}

/* Desktop: larger logo for better presence */
@media (min-width: 769px) {
  .logo-badge {
    width: 80px;
    height: 80px;
  }
  
  .logo {
    width: 64px;
    height: 64px;
  }
}

.header-text {
  text-align: center;
  width: 100%;
}

.main-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--brand-text-primary-color);
  margin: 0 0 8px 0;
}

/* Mobile: original size */
@media (max-width: 768px) {
  .main-title {
    font-size: var(--brand-font-size-5xl);
    line-height: 38px;
  }
}

/* Desktop: larger, more prominent */
@media (min-width: 769px) {
  .main-title {
    font-size: var(--brand-font-size-6xl);
    line-height: 52px;
  }
}

.subtitle {
  font-family: var(--brand-font-family);
  font-weight: 400;
  letter-spacing: -0.048px;
  color: var(--brand-text-secondary-color);
  margin: 0;
}

/* Mobile: original size */
@media (max-width: 768px) {
  .subtitle {
    font-size: var(--brand-font-size-base);
    line-height: 1.6;
  }
}

/* Desktop: slightly larger for better readability */
@media (min-width: 769px) {
  .subtitle {
    font-size: var(--brand-font-size-lg);
    line-height: 1.7;
  }
}

/* Content */
.login-content {
  --background: transparent;
}

.form-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 60vh;
}

/* Mobile: compact padding */
@media (max-width: 768px) {
  .form-container {
    padding: 24px 16px;
    min-height: auto;
  }
}

/* Desktop: centered with max-width */
@media (min-width: 769px) {
  .form-container {
    padding: 48px;
    max-width: 500px;
    margin: 0 auto;
  }
}

/* Large desktop: even more generous spacing */
@media (min-width: 1200px) {
  .form-container {
    max-width: 600px;
    padding: 64px;
  }
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
}

/* Mobile: compact spacing */
@media (max-width: 768px) {
  .login-form {
    gap: 24px;
  }
}

/* Desktop: more generous spacing */
@media (min-width: 769px) {
  .login-form {
    gap: 32px;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-sm);
  letter-spacing: -0.028px;
  color: var(--brand-text-primary-color);
}

.input-wrapper {
  position: relative;
  background: var(--brand-input-background-color);
  border: 1px solid transparent;
  border-radius: var(--brand-input-border-radius);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.input-wrapper.focused {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px var(--brand-focus-ring-color);
}

.input-wrapper.error {
  border-color: var(--ion-color-danger);
}

.input-icon {
  font-size: var(--brand-font-size-2xl);
  color: var(--brand-text-primary-color);
  flex-shrink: 0;
}

.custom-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--brand-font-family);
  font-weight: 500;
  font-size: var(--brand-font-size-base);
  letter-spacing: -0.048px;
  color: var(--brand-text-secondary-color);
  padding: 0;
}

.custom-input::placeholder {
  color: var(--brand-text-secondary-color);
}

.password-toggle {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.password-toggle ion-icon {
  font-size: var(--brand-font-size-2xl);
  color: var(--brand-gray-20, var(--brand-border-color));
}

.error-message {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  color: var(--ion-color-danger);
  margin-top: 4px;
}

/* Sign In Button */
.signin-button {
  background: var(--brand-secondary);
  border: none;
  border-radius: var(--brand-button-border-radius);
  height: 56px;
  padding: 16px 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  letter-spacing: -0.048px;
  color: var(--brand-text-on-primary-color);
}

.signin-button:hover:not(:disabled) {
  background: var(--brand-black);
  transform: translateY(-1px);
}

.signin-button:active:not(:disabled) {
  transform: translateY(0);
}

.signin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-spinner {
  --color: var(--brand-text-on-primary-color);
}

.button-arrow {
  font-size: var(--brand-font-size-2xl);
}

/* Home Indicator - Mobile only */
@media (max-width: 768px) {
  .home-indicator {
    position: fixed;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    background: var(--brand-black);
    border-radius: 3px;
  }
}

/* Desktop: hide home indicator */
@media (min-width: 769px) {
  .home-indicator {
    display: none;
  }
}

/* Desktop: Add subtle shadow for web presentation */
@media (min-width: 769px) {
  .ulpift-login {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  /* Add a subtle backdrop for better desktop presentation */
  .ulpift-login::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    z-index: -1;
  }
}

/* Focus states for accessibility */
.signin-button:focus,
.password-toggle:focus {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.custom-input:focus {
  outline: none;
}
</style>

