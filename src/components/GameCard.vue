<template>
    <!-- Treść gry terenowej -->
    <div class="game-content">
        <h3 class="mb-4">{{ $t('gameCard.welcome') }}</h3>

        <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
        >
            {{ $t('gameCard.instructions') }}
        </v-alert>

        <!-- Przykładowe sekcje gry -->
        <v-expansion-panels
            variant="accordion"
            class="mb-4"
        >
            <v-expansion-panel>
                <v-expansion-panel-title>
                    <v-icon class="mr-3">mdi-map-marker</v-icon>
                    {{ $t('gameCard.locations.title') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    {{ $t('gameCard.locations.content') }}
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-title>
                    <v-icon class="mr-3">mdi-trophy</v-icon>
                    {{ $t('gameCard.challenges.title') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    {{ $t('gameCard.challenges.content') }}
                </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-title>
                    <v-icon class="mr-3">mdi-account-group</v-icon>
                    {{ $t('gameCard.team.title') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    {{ $t('gameCard.team.content') }}
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>

        <!-- Przykładowa długa zawartość do testowania scroll -->
        <div class="mt-6">
            <h4 class="mb-3">{{ $t('gameCard.rules.title') }}</h4>
            <v-list lines="two">
                <v-list-item
                    v-for="n in 10"
                    :key="n"
                    :prepend-icon="`mdi-numeric-${n}-circle`"
                >
                    <v-list-item-title> {{ $t('gameCard.rules.rule') }} {{ n }} </v-list-item-title>
                    <v-list-item-subtitle>
                        {{ $t('gameCard.rules.description') }} {{ n }}
                    </v-list-item-subtitle>
                </v-list-item>
            </v-list>
        </div>

        <!-- Dodatkowa zawartość dla testowania -->
        <div class="mt-6">
            <h4 class="mb-3">{{ $t('gameCard.tips.title') }}</h4>
            <v-chip-group column>
                <v-chip
                    v-for="n in 8"
                    :key="n"
                    color="primary"
                    variant="outlined"
                >
                    {{ $t('gameCard.tips.tip') }} {{ n }}
                </v-chip>
            </v-chip-group>
        </div>
    </div>
</template>

<script setup>
// GameCard zawiera tylko zawartość - bez logiki wrapper'a
</script>

<style scoped>
/* Animacje zawartości */
.game-content {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
