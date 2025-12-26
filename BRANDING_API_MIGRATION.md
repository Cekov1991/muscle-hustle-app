# Branding API Migration Guide

## Overview

The branding system has been restructured with a cleaner, grouped API. The old flat API is still available for backward compatibility but is deprecated.

## New Grouped API (Recommended)

### Basic Usage

```javascript
import { useBranding } from '@/shared/composables/useBranding'

const branding = useBranding()

// Access colors
branding.colors.primary           // Primary color (hex)
branding.colors.secondary         // Secondary color (hex)
branding.colors.rgb.primary       // Primary RGB string for Ionic
branding.colors.shades.primary    // Primary shade (mode-aware)
branding.colors.background        // Background color
branding.colors.text.primary      // Primary text color
branding.colors.success           // Success color
branding.colors.gray.gray10       // Gray scale colors

// Access assets
branding.assets.logo              // Logo URL
branding.assets.backgroundPattern // Background pattern URL

// Access metadata
branding.metadata.partnerName     // Partner name
branding.metadata.fontFamily      // Font family
branding.metadata.isInitialized   // Whether branding is applied
branding.metadata.isDarkMode      // Current dark mode state

// Methods (shorter names)
branding.apply(partner)            // Apply partner branding
branding.applyDefault()           // Apply default branding
branding.reset()                  // Reset branding
```

### In Vue Components

```vue
<script setup>
import { useBranding } from '@/shared/composables/useBranding'

const { colors, assets, metadata } = useBranding()

// Use in template
// {{ colors.primary }}
// {{ assets.logo }}
// {{ metadata.partnerName }}
</script>

<template>
  <div :style="{ backgroundColor: colors.primary }">
    <img v-if="assets.logo" :src="assets.logo" :alt="metadata.partnerName" />
  </div>
</template>
```

### With Options API

```javascript
import { computed } from 'vue'
import { useBranding } from '@/shared/composables/useBranding'

export default {
  setup() {
    const { colors, assets, metadata } = useBranding()
    
    return {
      primaryColor: computed(() => colors.value.primary),
      logo: computed(() => assets.value.logo),
      partnerName: computed(() => metadata.value.partnerName)
    }
  }
}
```

## Old Flat API (Deprecated)

The old API still works but will be removed in a future version:

```javascript
const {
  primaryColor,
  secondaryColor,
  primaryColorRgb,
  logo,
  partnerName,
  fontFamily,
  isInitialized,
  applyPartnerBranding,
  applyDefaultBranding,
  resetBranding
} = useBranding()
```

## Migration Steps

1. **Replace flat destructuring with grouped API:**
   ```javascript
   // Old
   const { primaryColor, logo, partnerName } = useBranding()
   
   // New
   const { colors, assets, metadata } = useBranding()
   ```

2. **Update property access:**
   ```javascript
   // Old
   primaryColor
   logo
   partnerName
   
   // New
   colors.primary
   assets.logo
   metadata.partnerName
   ```

3. **Update method names:**
   ```javascript
   // Old
   applyPartnerBranding(partner)
   applyDefaultBranding()
   resetBranding()
   
   // New
   branding.apply(partner)
   branding.applyDefault()
   branding.reset()
   ```

4. **In templates, use computed properties:**
   ```vue
   <!-- Old -->
   <div>{{ primaryColor }}</div>
   
   <!-- New -->
   <div>{{ colors.primary }}</div>
   ```

## Benefits of New API

1. **Better Organization**: Related properties are grouped logically
2. **Clearer Intent**: `colors.primary` is more descriptive than `primaryColor`
3. **Type Safety**: Easier to add TypeScript types in the future
4. **Scalability**: Easy to add new color categories or asset types
5. **Shorter Method Names**: `apply()` instead of `applyPartnerBranding()`

## Complete Example

```vue
<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>
        <img 
          v-if="assets.logo" 
          :src="assets.logo" 
          :alt="metadata.partnerName"
          class="logo"
        />
        <span v-else>{{ metadata.partnerName }}</span>
      </ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import { useBranding } from '@/shared/composables/useBranding'

const { assets, metadata } = useBranding()
</script>
```

