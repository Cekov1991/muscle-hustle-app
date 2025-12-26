# Dynamic Partner Branding System 🎨

This fitness app implements dynamic partner branding that automatically applies custom colors, logos, and fonts based on the user's partner data received during login.

## 🚀 How It Works

1. **User logs in** → Backend returns partner data with visual identity
2. **`useAuth` stores** user data including partner info in reactive state
3. **`useBranding` watches** for user changes and automatically applies branding
4. **CSS custom properties** are updated dynamically across the entire app
5. **All Ionic components** inherit the new partner colors automatically

## 📊 Backend Data Format

The system expects partner data in this format from your login response:

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Kiril Atanasoski",
    "email": "user@example.com",
    "partner": {
      "id": 1,
      "name": "Muscle Hustle",
      "slug": "muscle-hustle", 
      "visual_identity": {
        "primary_color": "255,107,53",      // RGB string format
        "secondary_color": "78,205,196",    // RGB string format
        "logo": "/images/muscle-hustle-logo.png",
        "font_family": "Inter"
      }
    }
  },
  "token": "..."
}
```

**Important**: Colors are provided as RGB strings (e.g., `"255,107,53"`), not hex values. The system automatically converts these to hex for CSS compatibility.

## 🎯 Color Conversion

| RGB Input | Hex Output | Usage |
|-----------|------------|-------|
| `"255,107,53"` | `#FF6B35` | Primary color for buttons, headers, etc. |
| `"78,205,196"` | `#4ECDC4` | Secondary color for accents |

## 📁 File Structure

```
src/
├── shared/
│   ├── composables/
│   │   └── useBranding.js           # Core branding logic
│   ├── components/
│   │   ├── AppHeader.vue            # Example branded header
│   │   └── BrandingDemo.vue         # Demo component for testing
│   └── utils/
│       └── testBranding.js          # Testing utilities
├── theme/
│   └── branding.css                 # Partner branding CSS
└── App.vue                          # Main app with branding integration
```

## 🛠️ Usage Examples

### Using the Branding Composable

```vue
<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>
        <img v-if="logo" :src="logo" :alt="partnerName" class="gym-logo" />
        <span v-else>{{ partnerName }}</span>
      </ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script>
import { useBranding } from '../shared/composables/useBranding'

export default {
  setup() {
    const { logo, partnerName, primaryColor } = useBranding()
    
    return {
      logo,
      partnerName,
      primaryColor
    }
  }
}
</script>
```

### Accessing Branding Data (New Grouped API)

```javascript
import { useBranding } from '../shared/composables/useBranding'

const { colors, assets, metadata } = useBranding()

// Colors
colors.primary           // Hex color (e.g., "#FF6B35")
colors.secondary         // Hex color (e.g., "#4ECDC4")
colors.rgb.primary       // RGB string (e.g., "255,107,53")
colors.shades.primary    // Shade color (mode-aware)
colors.text.primary      // Text color
colors.success           // Semantic colors

// Assets
assets.logo              // Logo URL
assets.backgroundPattern // Background pattern URL

// Metadata
metadata.partnerName     // Partner name (e.g., "Muscle Hustle")
metadata.fontFamily      // Font family (e.g., "Inter")
metadata.isInitialized   // Boolean: is branding applied?
metadata.isDarkMode      // Boolean: is dark mode active?

// Methods
branding.apply(partner)  // Apply partner branding
branding.applyDefault()  // Apply default branding
branding.reset()         // Reset branding
```

### Legacy Flat API (Deprecated)

The old flat API still works but is deprecated:

```javascript
const {
  primaryColor,        // Hex color (e.g., "#FF6B35")
  secondaryColor,      // Hex color (e.g., "#4ECDC4")
  primaryColorRgb,     // RGB string (e.g., "255,107,53")
  secondaryColorRgb,   // RGB string (e.g., "78,205,196")
  logo,                // Logo URL
  partnerName,         // Partner name (e.g., "Muscle Hustle")
  fontFamily,          // Font family (e.g., "Inter")
  isInitialized        // Boolean: is branding applied?
} = useBranding()
```

See [BRANDING_API_MIGRATION.md](./BRANDING_API_MIGRATION.md) for migration guide.

## 🎨 CSS Custom Properties Applied

When branding is active, these CSS variables are automatically set:

### Color Variables
```css
--brand-primary: #FF6B35
--brand-secondary: #4ECDC4
--brand-primary-rgb: 255,107,53
--brand-secondary-rgb: 78,205,196
--brand-primary-shade: #e05528  /* Auto-generated darker shade */
--brand-secondary-shade: #44b8ac /* Auto-generated darker shade */

/* Ionic Integration */
--ion-color-primary: #FF6B35
--ion-color-secondary: #4ECDC4
--ion-color-primary-rgb: 255,107,53
--ion-color-secondary-rgb: 78,205,196
--ion-color-primary-shade: #e05528
--ion-color-secondary-shade: #44b8ac
```

### Asset Variables
```css
--brand-logo-url: url(/images/muscle-hustle-logo.png)
--brand-font-family: Inter
```

## 🧪 Testing the System

Use the provided test utility:

```javascript
import { testBrandingApplication } from '../shared/utils/testBranding'
import { useAuth } from '../features/auth/composables/useAuth'
import { useBranding } from '../shared/composables/useBranding'

// Test branding with simulated data
const testResults = testBrandingApplication(useAuth, useBranding)
console.log('Expected results:', testResults.expectedResults)
```

Include the `BrandingDemo` component to visually test branding:

```vue
<template>
  <ion-page>
    <ion-content>
      <BrandingDemo />
    </ion-content>
  </ion-page>
</template>

<script>
import BrandingDemo from '../shared/components/BrandingDemo.vue'
</script>
```

## 🔄 Automatic Behavior

### On Login
- Partner branding applies immediately when user data loads
- All components update to use partner colors
- Logo and font preferences take effect
- Changes persist across app restarts (via localStorage)

### On Logout  
- Branding resets to default fitness app theme
- All custom properties are removed
- Default colors and branding restored

## 🎯 Component Integration

The system automatically brands these Ionic components:

- **Buttons**: Primary/secondary colors, hover states
- **Toolbars**: Background colors, text colors
- **Cards**: Accent borders, themed styling
- **Progress Bars**: Partner color fills
- **Form Controls**: Checkboxes, radios, toggles, sliders
- **Navigation**: Tab bars, segment controls
- **Feedback**: Toasts, loading spinners

## 🛡️ Error Handling

- **Missing partner data**: Falls back to default branding
- **Invalid color format**: Uses default colors, logs warning
- **Missing logo**: Shows partner name as text fallback
- **Font loading issues**: Falls back to system fonts

## 🚀 Performance

- **Reactive Updates**: Only re-renders when branding actually changes
- **CSS Variables**: Efficient browser-native color updates
- **Shade Generation**: Calculated once on branding application
- **Memory Efficient**: Reuses same reactive state across components

---

## 🔧 Implementation Details

### Color Processing Pipeline

1. **Input**: RGB string from backend (`"255,107,53"`)
2. **Conversion**: RGB → Hex (`#FF6B35`)  
3. **Shade Generation**: Darker variant for hover states
4. **CSS Application**: Set custom properties on document root
5. **Component Integration**: Ionic components inherit new colors

### State Management Flow

```
Login Response → useAuth → useBranding → CSS Variables → UI Updates
     ↓              ↓          ↓            ↓            ↓
  Partner Data → User State → Branding → DOM Styles → Visual Changes
```

The system is now fully compatible with your backend's RGB string format and ready for production use! 🎉
