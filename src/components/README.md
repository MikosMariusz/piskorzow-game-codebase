# Components

Vue template files in this folder are automatically imported.

## Available Components

### AppCard

Jednolity komponent karty dla całej aplikacji z narzuconymi stylami.

**Funkcjonalności:**

- Border 3px w kolorze primary (responsywny: 2px na tablet, 1px na mobile)
- Gradient w tle
- Zwiększona grubość czcionki w tytułach
- Poprawiona czytelność tekstu (line-height: 1.6)

**Użycie:**

```vue
<AppCard>
  <v-card-title>Tytuł karty</v-card-title>
  <v-card-text>Treść karty</v-card-text>
  <v-card-actions>
    <v-btn>Akcja</v-btn>
  </v-card-actions>
</AppCard>
```

### AppBackground

Komponent tła z obrazkiem - ustawia się jako absolute w kontenerze rodzica.

**Funkcjonalności:**

- Tło z obrazka `app-background.png`
- Efekt blur i przyciemnienie (brightness: 0.7)
- Pozycjonowanie absolute (z-index: 1)
- Pełne pokrycie kontenera rodzica

**Użycie:**

```vue
<div class="position-relative" style="height: 100vh;">
  <AppBackground />
  <div class="position-relative" style="z-index: 2;">
    <AppCard>
      <v-card-text>Zawartość na tle</v-card-text>
    </AppCard>
  </div>
</div>
```

## 🚀 Usage

Importing is handled by [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components). This plugin automatically imports `.vue` files created in the `src/components` directory, and registers them as global components. This means that you can use any component in your application without having to manually import it.

The following example assumes a component located at `src/components/MyComponent.vue`:

```vue
<template>
    <div>
        <MyComponent />
    </div>
</template>

<script lang="ts" setup>
//
</script>
```

When your template is rendered, the component's import will automatically be inlined, which renders to this:

```vue
<template>
    <div>
        <MyComponent />
    </div>
</template>

<script lang="ts" setup>
import MyComponent from '@/components/MyComponent.vue'
</script>
```
