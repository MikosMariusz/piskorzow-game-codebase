# 🎮 Jak zrobić interaktywne kafelki na stronie głównej

Cześć! W tej instrukcji nauczysz się, jak stworzyć piękne, responsywne kafelki, które przenoszą użytkowników do różnych sekcji aplikacji. Będzie to wyglądać jak gra! 🚀

## 📋 Co już mamy przygotowane?

Przed rozpoczęciem sprawdź, czy w projekcie masz:

- ✅ Obrazy w folderze `src/assets/images/`:
    - `gra_terenowa_logo.png` (dla kafelka gry)
    - `interaktywna_prezentacja.png` (dla kafelka prezentacji)

## 🎯 Nasz cel

Chcemy stworzyć:

1. **Stronę główną** z dwoma kafelkami
2. **Kafelek "Gra terenowa"** → prowadzi do `/game`
3. **Kafelek "Prezentacja wsi"** → prowadzi do `/presentation`
4. **Responsywny design** - działa na telefonie, tablecie i komputerze
5. **Efekty hover** - kafelki "unoszą się" gdy najedziemy myszką

---

## 🔧 Krok 1: Stwórz stronę główną

W folderze `src/pages/` stwórz plik `index.vue`. To będzie Twoja strona główna!

**Zacznij od podstawowej struktury:**

```vue
<template>
    <div class="home-layer">
        <!-- Tutaj będą nasze kafelki -->
    </div>
</template>

<script setup>
// Tutaj będzie logika
</script>

<style scoped>
/* Tutaj będą style */
</style>
```

**Co to znaczy?**

- `<template>` - to jest wygląd strony (HTML)
- `<script setup>` - to jest logika i funkcje (JavaScript)
- `<style scoped>` - to są style tylko dla tej strony (CSS)

---

## 🔧 Krok 2: Dodaj importy i podstawową logikę

W sekcji `<script setup>` dodaj potrzebne importy:

```javascript
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
```

**Co to robi?**

- `useRouter()` - pozwala nam przenosić użytkowników między stronami
- `useI18n()` - pozwala nam używać tłumaczeń (PL/EN)

---

## 🔧 Krok 3: Stwórz dane o kafelkach

Dodaj tablicę z informacjami o kafelkach:

```javascript
const tiles = [
    {
        id: 'game',
        title: 'terrainGame',
        route: '/game',
        image: new URL('../assets/images/gra_terenowa_logo.png', import.meta.url).href,
        alt: 'terrainGame',
        fallbackText: 'terrainGame',
    },
    {
        id: 'presentation',
        title: 'villagePresentation',
        route: '/presentation',
        image: new URL('../assets/images/interaktywna_prezentacja.png', import.meta.url).href,
        alt: 'villagePresentation',
        fallbackText: 'villagePresentation',
    },
]
```

**Co zawiera każdy kafelek?**

- `id` - unikalna nazwa kafelka
- `title` - klucz do tłumaczenia tytułu
- `route` - ścieżka do której ma prowadzić
- `image` - ścieżka do obrazka w tle
- `alt` - tekst alternatywny dla obrazka
- `fallbackText` - tekst na wypadek gdyby obrazek się nie załadował

---

## 🔧 Krok 4: Dodaj funkcję nawigacji

Stwórz funkcję, która przenosi użytkowników do innych stron:

```javascript
function go(path) {
    router.push(path)
}

function getTileTitle(tile) {
    return t(tile.title)
}
```

**Co robią te funkcje?**

- `go(path)` - przenosi użytkownika do podanej ścieżki
- `getTileTitle(tile)` - pobiera przetłumaczony tytuł kafelka

---

## 🔧 Krok 5: Stwórz szablon kafelków

W sekcji `<template>` zastąp komentarz tym kodem:

```vue
<div class="home-layer">
    <v-container class="pa-1 h-100" fluid>
        <v-row class="justify-center align-center tiles-wrapper h-100" no-gutters>
            <v-col
                v-for="tile in tiles"
                :key="tile.id"
                cols="12"
                sm="6"
                md="6"
                lg="6"
                xl="4"
                class="d-flex justify-center align-center pa-0"
            >
                <v-card
                    class="glass-card tile-card position-relative"
                    role="button"
                    elevation="8"
                    tabindex="0"
                    rounded="lg"
                    @click="go(tile.route)"
                    @keyup.enter.space="go(tile.route)"
                >
                    <!-- Zawartość kafelka będzie tutaj -->
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</div>
```

**Co to robi?**

- `v-for="tile in tiles"` - tworzy kafelek dla każdego elementu z tablicy
- `cols="12" sm="6"` - responsywne kolumny (1 na telefonie, 2 na tablecie)
- `@click="go(tile.route)"` - po kliknięciu przechodzi do odpowiedniej strony

---

## 🔧 Krok 6: Dodaj zawartość kafelków

Wewnątrz `<v-card>` dodaj:

```vue
<div class="tile-content position-relative w-100 h-100">
    <!-- Obrazek w tle -->
    <v-img
        v-if="tile.image"
        :src="tile.image"
        :alt="tile.alt"
        cover
        height="100%"
        width="100%"
        class="position-absolute"
        style="top: 0; left: 0"
    />

    <!-- Tekst zastępczy (gdy brak obrazka) -->
    <div
        v-else
        class="h-100 w-100 d-flex align-center justify-center pa-2 text-center text-white font-weight-medium fallback-text"
    >
        {{ tile.fallbackText }}
    </div>

    <!-- Etykieta z tytułem -->
    <div
        class="position-absolute d-flex align-center justify-center"
        style="top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2;"
    >
        <v-sheet class="tile-label-sheet pa-2" elevation="4" rounded="lg">
            <p class="text-center tile-title font-weight-light ma-1">
                {{ getTileTitle(tile) }}
            </p>
        </v-sheet>
    </div>
</div>
```

**Co się dzieje?**

- `v-img` - wyświetla obrazek jako tło kafelka
- `v-else` - pokazuje tekst gdy obrazek się nie załaduje
- `v-sheet` - to białe, półprzezroczyste pudełko z tytułem

---

## 🔧 Krok 7: Dodaj piękne style

W sekcji `<style scoped>` dodaj:

```css
.home-layer {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1200;
    overflow: hidden;
}

.tile-card {
    pointer-events: auto;
    width: 100%;
    max-width: 450px;
    aspect-ratio: 1;
    overflow: hidden;
    transition:
        transform 0.25s,
        box-shadow 0.25s,
        background 0.25s;
    margin: 0.25rem;
}

.glass-card {
    background: rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.tile-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6);
}

.tile-label-sheet {
    background: rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 90%;
}

.tile-title {
    font-size: clamp(0.9rem, 3.5vw, 1.5rem);
    line-height: 1.2;
    text-align: center;
}
```

**Co robią te style?**

- `.home-layer` - pozycjonuje kafelki na środku ekranu
- `.tile-card` - określa rozmiar i kształt kafelków
- `.glass-card` - daje efekt szkła (blur i przezroczystość)
- `:hover` - animacja gdy najedziemy myszką
- `clamp()` - responsywne rozmiary czcionek

---

## 🔧 Krok 8: Dodaj responsywność

Dodaj media queries dla różnych urządzeń:

```css
/* Telefon pionowo */
@media (max-width: 599px) {
    .tile-card {
        max-width: min(85vw, 320px);
        min-height: min(85vw, 320px);
    }

    .tile-title {
        font-size: clamp(0.8rem, 4vw, 1.1rem) !important;
    }
}

/* Tablet */
@media (min-width: 600px) and (max-width: 959px) {
    .tile-card {
        max-width: min(42vw, 280px);
        min-height: min(42vw, 280px);
    }
}

/* Desktop */
@media (min-width: 1280px) {
    .tile-card {
        max-width: min(35vw, 450px);
        min-height: min(35vw, 450px);
    }
}
```

---

## 🔧 Krok 9: Sprawdź wynik

Zapisz plik i sprawdź w przeglądarce!

**Powinieneś zobaczyć:**

- ✅ Dwa piękne kafelki na środku ekranu
- ✅ Obrazki w tle kafelków
- ✅ Efekt "unoszenia się" przy najechaniu myszką
- ✅ Responsywny layout (sprawdź na telefonie!)
- ✅ Kliknięcie przenosi do `/game` lub `/presentation`

---

## 🎉 Gratulacje! Co osiągnąłeś?

Twoje kafelki mają teraz:

- ✅ **Piękny design** - efekt szkła i animacje
- ✅ **Responsywność** - działają na wszystkich urządzeniach
- ✅ **Nawigację** - przenoszą do odpowiednich stron
- ✅ **Tłumaczenia** - wspierają różne języki
- ✅ **Dostępność** - działają z klawiaturą

---

## 🐛 Co robić, gdy coś nie działa?

### Problem: Nie widzę kafelków

**Rozwiązanie:**

1. Sprawdź czy plik `index.vue` jest w folderze `src/pages/`
2. Sprawdź czy obrazki są w folderze `src/assets/images/`
3. Sprawdź konsołę (F12) czy są błędy

### Problem: Kafelki nie przenoszą do innych stron

**Rozwiązanie:**

1. Sprawdź czy masz pliki `game.vue` i `presentation.vue` w `src/pages/`
2. Sprawdź czy funkcja `go()` jest poprawnie napisana

### Problem: Obrazki się nie pokazują

**Rozwiązanie:**

1. Sprawdź nazwy plików - czy są dokładnie takie jak w kodzie?
2. Sprawdź czy obrazki są w folderze `src/assets/images/`

### Problem: Nie działa responsywność

**Rozwiązanie:**

1. Sprawdź czy skopiowałeś wszystkie media queries
2. Testuj w trybie responsywnym przeglądarki (F12)

---

## 🏆 Dodatkowe wyzwania

Jeśli chcesz więcej, spróbuj:

1. **Dodaj trzeci kafelek** - np. dla "O nas" → `/about`
2. **Zmień kolory** - eksperymentuj z `background` i `border`
3. **Dodaj ikony** - zamiast lub obok obrazków
4. **Stwórz animacje** - np. rotację przy hover
5. **Dodaj dźwięki** - odgłos kliknięcia kafelka
6. **Zrób tryb ciemny** - inne kolory dla dark mode

---

## 💡 Jak to działa w środku?

**Dla ciekawskich:**

### **Router Vue:**

```javascript
router.push('/game') // Przenosi do strony /game
```

### **Responsywne kolumny Vuetify:**

```vue
cols="12"
<!-- 12/12 = 100% szerokości (telefon) -->
sm="6"
<!-- 6/12 = 50% szerokości (tablet) -->
lg="4"
<!-- 4/12 = 33% szerokości (desktop) -->
```

### **CSS clamp() dla responsywnych fontów:**

```css
clamp(0.9rem, 3.5vw, 1.5rem)
/* minimum | preferowana | maksimum */
```

### **Efekt szkła (glassmorphism):**

```css
backdrop-filter: blur(8px); /* Rozmywa tło */
background: rgba(255, 255, 255, 0.2); /* Półprzezroczyste białe tło */
```

---

## 🎓 Podsumowanie

Brawo! 🎉 Stworzyłeś profesjonalną stronę główną z interaktywnymi kafelkami!

**Nauczyłeś się:**

- ✅ Tworzyć komponenty Vue z template, script i style
- ✅ Używać Vue Router do nawigacji
- ✅ Pracować z Vuetify (v-card, v-container, v-row, v-col)
- ✅ Dodawać responsywność z CSS media queries
- ✅ Tworzyć efekty hover i animacje
- ✅ Używać i18n do tłumaczeń
- ✅ Importować obrazki w Vue
- ✅ Debugować problemy w kodzie

**Następny krok:** Stwórz strony `/game` i `/presentation`, żeby Twoje kafelki miały dokąd prowadzić! 🚀

---

## 📚 Dodatkowe materiały

**Przydatne linki:**

- [Vuetify Components](https://vuetifyjs.com/en/components/cards/) - dokumentacja komponentów
- [CSS Glassmorphism](https://css.glass/) - generator efektu szkła
- [Vue Router](https://router.vuejs.org/) - oficjalna dokumentacja routera
- [CSS Clamp](<https://developer.mozilla.org/en-US/docs/Web/CSS/clamp()>) - responsywne rozmiary
