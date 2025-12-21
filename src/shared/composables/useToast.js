import { toastController } from '@ionic/vue'

export const useToast = () => {
  
  const showToast = async (message, options = {}) => {
    const defaultOptions = {
      message,
      duration: 3000,
      position: 'bottom',
      color: 'primary',
      buttons: []
    }
    
    const toastOptions = { ...defaultOptions, ...options }
    
    const toast = await toastController.create(toastOptions)
    await toast.present()
    
    return toast
  }

  const showSuccess = async (message, duration = 3000) => {
    return showToast(message, {
      color: 'success',
      duration,
      icon: 'checkmark-circle-outline'
    })
  }

  const showError = async (message, duration = 4000) => {
    return showToast(message, {
      color: 'danger',
      duration,
      icon: 'alert-circle-outline'
    })
  }

  const showWarning = async (message, duration = 3500) => {
    return showToast(message, {
      color: 'warning',
      duration,
      icon: 'warning-outline'
    })
  }

  const showInfo = async (message, duration = 3000) => {
    return showToast(message, {
      color: 'tertiary',
      duration,
      icon: 'information-circle-outline'
    })
  }

  const showToastWithAction = async (message, actionText = 'Dismiss', actionHandler = null) => {
    return showToast(message, {
      duration: 0, // Don't auto-dismiss
      buttons: [
        {
          text: actionText,
          role: 'cancel',
          handler: actionHandler || (() => {})
        }
      ]
    })
  }

  // Utility function for loading states
  const showLoading = async (message = 'Loading...') => {
    return showToast(message, {
      duration: 0,
      color: 'medium',
      icon: 'hourglass-outline'
    })
  }

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToastWithAction,
    showLoading
  }
}
