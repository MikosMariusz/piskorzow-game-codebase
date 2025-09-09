# Zasady kodowania - Piskorzów Game

## Ogólne zasady

### Język i komentarze

- Kod: **angielski** (nazwy zmiennych, funkcji, klas)
- Komentarze: **polski** (wyjaśnienia i dokumentacja)
- Commit messages: **polski**

### Formatowanie

- Indentacja: **4 spacje** (nie taby)
- Cudzysłowy: **pojedyncze** dla JS/Vue (''), **podwójne** dla HTML atrybutów ("")
- Średniki: **zawsze** na końcu instrukcji
- Maksymalna długość linii: **120 znaków**

## Vue.js

### Struktura komponentów

```vue
<template>
    <!-- HTML -->
</template>

<script setup>
// Importy
// Composables
// Reactive data
// Computed
// Methods
// Watchers
// Lifecycle hooks
</script>

<style scoped>
/* Stylowanie */
</style>
```

### Nazewnictwa

- Komponenty: **PascalCase** (AppBar.vue, MapBackground.vue)
- Pliki Vue: **PascalCase** lub **kebab-case**
- Props: **camelCase**
- Events: **kebab-case**
- CSS klasy: **kebab-case**

### Props i emits

```js
// Zawsze definiuj typy props
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    isVisible: {
        type: Boolean,
        default: false,
    },
})

// Zawsze definiuj emits
const emit = defineEmits(['update:modelValue', 'close'])
```

## JavaScript

### Nazewnictwa

- Zmienne/funkcje: **camelCase**
- Stałe: **UPPER_SNAKE_CASE**
- Klasy: **PascalCase**

### Funkcje

- **ZAWSZE** używaj **arrow functions** dla wszystkich metod
- Zawsze używaj **const/let**, nigdy **var**
- Bez niepotrzebnych komentarzy i pustych linii

```js
const calculateDistance = (point1, point2) => {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2)
}
const initializeMap = () => {
    // tylko jeśli naprawdę potrzebne
}
```

## Pinia Store

### Struktura

```js
export const useAppStore = defineStore('app', () => {
    // State
    const loading = ref(false)

    // Getters
    const isLoading = computed(() => loading.value)

    // Actions
    function setLoading(value) {
        loading.value = value
    }

    return {
        // state
        loading,
        // getters
        isLoading,
        // actions
        setLoading,
    }
})
```

## OpenLayers

### Nazewnictwa

- Mapy: **map** (główna instancja)
- Warstwy: **layer** + nazwa (vectorLayer, osmLayer)
- Źródła: **source** + nazwa (vectorSource, osmSource)
- Style: **style** + nazwa (defaultStyle, highlightStyle)

### Organizacja

- Wszystkie funkcje map w `services/olMap.js`
- Style w oddzielnych obiektach
- Konfiguracja w stałych na górze pliku

## CSS/SCSS

### PRIORYTET: Vuetify First!

- **ZAWSZE** najpierw szukaj rozwiązania w Vuetify
- Używaj klas utility: `ma-2`, `pa-4`, `d-flex`, `justify-center`
- Wykorzystuj komponenty Vuetify: `v-card`, `v-btn`, `v-container`
- Używaj systemu kolorów: `primary`, `secondary`, `error`
- Responsive: `sm`, `md`, `lg`, `xl`
- **Customowy CSS tylko jeśli Vuetify nie wystarcza**

### Jeśli musisz pisać CSS

- Używaj **SCSS**
- Zagnieżdżanie maksymalnie **2 poziomy**
- Zmienne w `styles/settings.scss`

### Nazewnictwa

- Klasy: **kebab-case**
- Zmienne SCSS: **$kebab-case**
- Mixiny: **camelCase**

## Struktura plików

### Organizacja

```
src/
├── components/     # Komponenty wielokrotnego użytku
├── layouts/        # Layouty stron
├── pages/         # Strony aplikacji
├── services/      # Logika biznesowa, API
├── stores/        # Pinia stores
├── plugins/       # Konfiguracja pluginów
├── router/        # Konfiguracja routingu
└── styles/        # Globalne style
```

### Nazewnictwa plików

- Vue komponenty: **PascalCase.vue** lub **kebab-case.vue**
- JS/TS pliki: **camelCase.js** lub **kebab-case.js**
- Style: **kebab-case.scss**

## Komentarze i dokumentacja

### Minimalizm w komentarzach

- **NIE** pisz komentarzy tłumaczących oczywiste rzeczy
- **NIE** dodawaj pustych linii bez potrzeby
- Komentarze tylko dla skomplikowanej logiki biznesowej
- JSDoc tylko dla publicznych API

```js
// ŹLE - niepotrzebne
const user = getUser() // pobiera użytkownika
// pusta linia niepotrzebna

const isValid = validateUser(user) // waliduje użytkownika

// DOBRZE - zwięźle
const user = getUser()
const isValid = validateUser(user)
```

## Git

### Commit messages

```
feat: dodaj nową funkcję mapy
fix: napraw błąd ładowania warstw
style: popraw formatowanie kodu
refactor: reorganizuj strukturę store
docs: aktualizuj dokumentację API
```

### Branching

- `main` - produkcja
- `develop` - rozwój
- `feature/nazwa-funkcji` - nowe funkcje
- `fix/nazwa-bledu` - poprawki

---

## Przykłady

### Komponent Vue

```vue
<template>
    <v-container class="pa-0">
        <v-card
            :class="{ 'opacity-50': isLoading }"
            elevation="2"
        >
            <div
                ref="mapElement"
                class="map-element"
            ></div>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMapStore } from '@/stores/map'

const props = defineProps({
    center: {
        type: Array,
        default: () => [0, 0],
    },
})
const mapStore = useMapStore()
const mapElement = ref(null)
const isLoading = computed(() => mapStore.loading)
const initializeMap = () => {
    // kod inicjalizacji
}
onMounted(() => {
    initializeMap()
})
</script>

<style scoped lang="scss">
.map-element {
    width: 100%;
    height: 400px;
}
</style>
```

### Service

```js
import Map from 'ol/Map'
import View from 'ol/View'

const DEFAULT_ZOOM = 10
const DEFAULT_CENTER = [19.145, 51.919]

class MapService {
    constructor() {
        this.map = null
        this.layers = new Map()
    }
    initMap = (target) => {
        this.map = new Map({
            target,
            view: new View({
                center: DEFAULT_CENTER,
                zoom: DEFAULT_ZOOM,
            }),
        })
        return this.map
    }
}

export default new MapService()
```

---

_Ostatnia aktualizacja: ${new Date().toLocaleDateString('pl-PL')}_
