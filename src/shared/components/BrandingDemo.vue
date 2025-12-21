<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Dynamic Branding Demo</ion-card-title>
      <ion-card-subtitle>Partner: {{ partnerName }}</ion-card-subtitle>
    </ion-card-header>
    
    <ion-card-content>
      <div class="branding-info">
        <div class="color-samples">
          <div class="color-sample">
            <div 
              class="color-box" 
              :style="{ backgroundColor: primaryColor }"
            ></div>
            <div class="color-info">
              <span>Primary: {{ primaryColor }}</span>
              <small>RGB: {{ primaryColorRgb }}</small>
            </div>
          </div>
          
          <div class="color-sample">
            <div 
              class="color-box" 
              :style="{ backgroundColor: secondaryColor }"
            ></div>
            <div class="color-info">
              <span>Secondary: {{ secondaryColor }}</span>
              <small>RGB: {{ secondaryColorRgb }}</small>
            </div>
          </div>
        </div>
        
        <div v-if="logo" class="logo-preview">
          <ion-label>Logo:</ion-label>
          <img :src="logo" :alt="partnerName" class="gym-logo-large" />
        </div>
        
        <div v-if="fontFamily" class="font-preview">
          <ion-label>Font Family: {{ fontFamily }}</ion-label>
        </div>
        
        <div class="component-demos">
          <ion-label>Component Examples:</ion-label>
          
          <div class="demo-row">
            <ion-button color="primary">Primary Button</ion-button>
            <ion-button color="secondary">Secondary Button</ion-button>
            <ion-button fill="outline" color="primary">Outline</ion-button>
          </div>
          
          <div class="demo-row">
            <ion-progress-bar value="0.5"></ion-progress-bar>
          </div>
          
          <div class="demo-row">
            <ion-checkbox checked></ion-checkbox>
            <ion-label>Branded Checkbox</ion-label>
          </div>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script>
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent,
  IonButton,
  IonProgressBar,
  IonCheckbox,
  IonLabel
} from '@ionic/vue'
import { useBranding } from '../composables/useBranding'

export default {
  name: 'BrandingDemo',
  components: {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonProgressBar,
    IonCheckbox,
    IonLabel
  },
  setup() {
    const { 
      primaryColor, 
      secondaryColor, 
      primaryColorRgb,
      secondaryColorRgb,
      logo, 
      partnerName, 
      fontFamily 
    } = useBranding()
    
    return {
      primaryColor,
      secondaryColor,
      primaryColorRgb,
      secondaryColorRgb,
      logo,
      partnerName,
      fontFamily
    }
  }
}
</script>

<style scoped>
.branding-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-samples {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.color-sample {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-info small {
  color: var(--ion-color-medium);
  font-size: 0.8em;
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid var(--ion-color-medium);
}

.logo-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.font-preview {
  font-style: italic;
}

.component-demos {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .color-samples {
    flex-direction: column;
  }
  
  .demo-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
