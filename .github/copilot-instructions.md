# Piskorzów Interactive Village Project - AI Coding Instructions

## Project Overview

Interactive cultural heritage application for Piskorzów village featuring a GPS-based terrain game and village presentation. Built with Vue 3, Vuetify, and OpenLayers mapping.

## Architecture & Core Patterns

### Component Communication

- **Global State**: `useAppStore()` (Pinia) manages GPS access, dark mode, loading states, and game card visibility
- **Map Service**: `services/olMap.js` provides singleton OpenLayers instance with callback-based event system
- **GPS Service**: `services/gps.js` handles geolocation with mobile device detection and accuracy validation

### Key Data Flows

1. **GPS Gate**: App checks GPS on load → enables/disables terrain game → updates UI accordingly
2. **Map Integration**: Background map with overlay UI components (attributions, zoom controls)
3. **Theme System**: Route-based dark/light mode switching with map canvas filter animations

### Component Hierarchy

```
App.vue (main container)
├── LoadingOverlay (startup state)
├── ProjectInfoDialog (first-visit modal)
├── CardWrapper + GameCard (game interface)
├── AppBar (navigation)
├── router-view (pages)
└── MapBackground (persistent map)
    ├── MapAttributions (OSM credits + coordinates)
    └── MapZoomControls (+ / - buttons)
```

## Critical Conventions

### OpenLayers Integration

- **Service Pattern**: All map functions in `services/olMap.js`, exported as named functions
- **Callback System**: `setCoordinatesCallback()`, `setZoomCallback()` for real-time UI updates
- **Singleton Map**: One `_map` instance, multiple components attach via callbacks
- **Layer Management**: Vector layers for GeoJSON, auto-loads `piskorzow.geojson` on init

### Vuetify Usage Patterns

- **Prefer Vuetify Components**: Use `v-card`, `v-btn`, `v-chip` over custom HTML/CSS
- **Theme Integration**: Access theme via `useTheme()`, use conditional classes for dark/light mode
- **Responsive Design**: Vuetify breakpoints with custom media queries for complex layouts

### State Management Patterns

- **Route-Based Theming**: Dark mode on index page, light mode elsewhere
- **Loading Sequences**: 3-second minimum loading with GPS check overlay

## Development Workflows

### Map Component Development

```javascript
// Add new map interaction
export const newMapFunction = () => {
    if (_map) {
        // OpenLayers operation
        const view = _map.getView()
        // Always include animation for UX
        view.animate({ /* params */, duration: 300 })
    }
}

// Register in MapBackground.vue
onMounted(() => {
    setCallbackFunction((data) => {
        // Update component state
        refValue.value = data
    })
})
```

### Internationalization

- **Languages**: Polish (primary), English, Spanish in `public/langs.json`
- **Usage**: `const { t } = useI18n()` then `t('key.nested')`
- **GPS States**: Special handling for "terrain game unavailable" messaging

### Vuetify Component Pattern

```vue
<template>
    <v-card
        elevation="4"
        rounded="sm"
    >
        <v-card-text class="pa-3">
            <!-- Use Vuetify spacing classes -->
        </v-card-text>
    </v-card>
</template>

<script setup>
import { useTheme } from 'vuetify'
const theme = useTheme()
// Access: theme.global.current.value.dark
</script>
```

## Key Integration Points

### GPS-Map Connection

- GPS service determines game availability
- Map components conditional on `props.interactive`

### Component Positioning System

- **Fixed Overlays**: `position: fixed` with z-index layers
- **App Bar Awareness**: Components positioned relative to 64px app bar height
- **Responsive Adjustments**: Different positioning for mobile breakpoints

### File Paths & Assets

- **GeoJSON**: `public/geometries/` for map data
- **Images**: `src/assets/images/` with Vite URL imports
- **Translations**: `public/langs.json` for runtime loading

## Development Commands

```bash
npm run dev        # Dev server on port 3531
npm run build      # Production build
npm run lint:fix   # Auto-fix ESLint issues
```

## Code Quality Standards

### Comments & Logging

- **Avoid Comments**: Write self-documenting code; add comments only for complex algorithms or business logic
- **Console Logs**: Never add `console.log` statements unless explicitly requested
- **Clean Code**: Code should be readable without explanatory comments

### Vue 3 Standards

- **Composition API Only**: Always use `<script setup>`, never Options API
- **Concise & Clear**: Write minimal, readable code without unnecessary elements

## Anti-Patterns to Avoid

- Don't bypass the map service singleton - always use exported functions
- Don't create custom CSS for components that Vuetify provides
- Don't add verbose comments or console.logs without explicit request
- Don't use Options API - stick to Composition API `<script setup>`
