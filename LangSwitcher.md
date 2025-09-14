# 🌍 Jak zrobić przycisk do zmiany języka

Cześć! W tej instrukcji nauczysz się, jak dodać przycisk do zmiany języka w aplikacji. Będziemy robić to krok po kroku! 🚀

# 🌍 Jak zrobić przycisk do zmiany języka

Cześć! W tej instrukcji nauczysz się, jak zrobić od zera przycisk do zmiany języka w aplikacji. Będziemy robić to krok po kroku! 🚀

## 📋 Co już mamy przygotowane?

Przed rozpoczęciem sprawdź, czy w projekcie masz:

- ✅ Biblioteka `i18n` jest już zainstalowana
- ✅ Plik `public/langs.json` z tłumaczeniami
- ✅ Pusty `AppBar.vue` czeka na Twoje zmiany

## 🎯 Nasz cel

Chcemy:

1. **Stworzyć** komponent `LangSwitcher` z przyciskami PL/EN
2. **Dodać** go do górnego paska aplikacji
3. **Sprawić**, żeby zmieniał język po kliknięciu

---

## 🔧 Krok 1: Stwórz nowy plik LangSwitcher.vue

W folderze `src/components/` stwórz nowy plik o nazwie `LangSwitcher.vue`.

**Skopiuj do niego ten kod:**

```vue
<template>
    <v-btn-toggle
        v-model="model"
        variant="elevated"
        density="comfortable"
        color="primary"
        rounded="sm"
        elevation="4"
    >
        <v-btn
            value="pl"
            size="small"
        >
            PL
        </v-btn>
        <v-btn
            value="en"
            size="small"
        >
            EN
        </v-btn>
    </v-btn-toggle>
</template>

<script setup>
import { inject, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const setLocale = inject('setLocale')
const { locale } = useI18n()

const model = computed({
    get: () => locale.value,
    set: (val) => setLocale?.(val),
})
</script>
```

**Co to znaczy?**

- `<template>` - to wygląd naszego komponentu (dwa przyciski PL i EN)
- `<script setup>` - to logika, która sprawia że przyciski zmieniają język
- `v-btn-toggle` - grupa przycisków, gdzie tylko jeden może być aktywny

---

## 🔧 Krok 2: Sprawdź czy plik się zapisał

**Upewnij się, że:**

1. Plik `LangSwitcher.vue` jest w folderze `src/components/`
2. Kod został skopiowany poprawnie (bez błędów)
3. Plik został zapisany (Ctrl+S)

**Podpowiedź:** Jeśli widzisz czerwone podkreślenia w edytorze - sprawdź czy nie brakuje jakiejś klamry lub cudzysłowu!

---

## 🔧 Krok 3: Znajdź AppBar.vue

Otwórz plik `src/components/AppBar.vue`. To jest górny pasek aplikacji.

**Twoje zadanie:** Znajdź linię z `<v-spacer />` - to jest miejsce, gdzie dodamy nasz przycisk!

---

## 🔧 Krok 4: Zaimportuj LangSwitcher

Na górze pliku `AppBar.vue`, w sekcji `<script setup>`, dodaj import:

```javascript
import LangSwitcher from './LangSwitcher.vue'
```

**Co to robi?**

- Mówi aplikacji: "Chcę używać komponentu LangSwitcher, który właśnie stworzyłem"
- Teraz możemy go użyć w naszym szablonie

**Gdzie to dodać?** Szukaj sekcji podobnej do:

```javascript
<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
// TUTAJ DODAJ IMPORT LangSwitcher
```

---

## 🔧 Krok 5: Dodaj przycisk do paska

W sekcji `<template>` znajdź `<v-spacer />` i **PRZED** nim dodaj:

```vue
<LangSwitcher class="mr-4" />
```

**Co to znaczy?**

- `<LangSwitcher />` - dodaje nasz przycisk języka
- `class="mr-4"` - dodaje margines z prawej strony (żeby przycisk nie przyklejał się do krawędzi)

---

## 🔧 Krok 6: Sprawdź wynik

Po zapisaniu pliku, Twoja aplikacja powinna mieć przycisk PL/EN w górnym pasku!

**Struktura powinna wyglądać tak:**

```vue
<template>
    <v-app-bar>
        <v-toolbar-title>{{ $t('gameTitle') }}</v-toolbar-title>
        <v-spacer />

        <!-- TUTAJ DODAŁEŚ PRZYCISK -->
        <LangSwitcher class="mr-4" />
    </v-app-bar>
</template>
```

---

## 🎉 Gotowe! Co teraz?

Twój przycisk języka powinien:

- ✅ Pokazywać się w górnym pasku
- ✅ Mieć dwa przyciski: PL i EN
- ✅ Zmieniać język aplikacji po kliknięciu
- ✅ Zapamiętywać wybrany język

---

## 🐛 Co robić, gdy coś nie działa?

### Problem: Nie widzę przycisku

**Rozwiązanie:** Sprawdź, czy:

1. Stworzyłeś plik `LangSwitcher.vue` w folderze `src/components/`
2. Skopiowałeś cały kod do tego pliku
3. Dodałeś import na górze pliku `AppBar.vue`
4. Dodałeś `<LangSwitcher />` w odpowiednim miejscu
5. Zapisałeś oba pliki

### Problem: Błąd "Cannot resolve component"

**Rozwiązanie:**

- Sprawdź pisownię: czy napisałeś `LangSwitcher` (z dużą literą L i S)?
- Sprawdź ścieżkę importu: `'./LangSwitcher.vue'`

### Problem: Przycisk nie zmienia języka

**Rozwiązanie:**

- To znaczy, że i18n nie jest poprawnie skonfigurowane
- Sprawdź, czy plik `public/langs.json` istnieje
- Sprawdź czy skopiowałeś część `<script setup>` w LangSwitcher.vue

---

## 🏆 Dodatkowe wyzwania

Jeśli chcesz więcej, spróbuj:

1. **Zmień wygląd przycisków** - dodaj inne kolory lub ikony flagek 🇵🇱🇬🇧
2. **Dodaj więcej języków** - np. niemiecki (DE) 🇩🇪
3. **Zmień pozycję** - umieść przycisk w innym miejscu paska
4. **Dodaj animacje** - sprawdź jakie efekty ma Vuetify
5. **Stwórz swój własny komponent** - np. przycisk zmiany motywu (ciemny/jasny)

---

## 💡 Jak to działa w środku?

**Dla ciekawskich:**

1. `LangSwitcher` używa biblioteki `vue-i18n`
2. Gdy klikniesz PL lub EN, zmienia się `locale.value`
3. Funkcja `setLocale()` zapisuje wybór w localStorage
4. Wszystkie teksty z `$t()` automatycznie się zmieniają!

**Magiczne funkcje:**

- `$t('gameTitle')` - bierze tłumaczenie dla "gameTitle"
- `inject('setLocale')` - dostaje funkcję do zmiany języka
- `localStorage` - zapamiętuje wybór nawet po zamknięciu przeglądarki

---

## 🎓 Podsumowanie

Gratulacje! 🎉 Właśnie dodałeś funkcjonalność wielojęzyczności do aplikacji!

**Nauczyłeś się:**

- ✅ Jak tworzyć nowe komponenty Vue
- ✅ Jak pisać kod template i script
- ✅ Jak importować komponenty
- ✅ Jak dodawać elementy do szablonu
- ✅ Jak działa biblioteka i18n
- ✅ Jak debugować problemy

**Następny krok:** Spróbuj dodać przycisk języka do innych stron aplikacji! 🚀
