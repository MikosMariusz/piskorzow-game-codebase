<template>
    <v-app>
        <AppBar />
        <router-view />
        <MapBackground />
    </v-app>
</template>

<script setup>
import MapBackground from '@/components/MapBackground.vue'
</script>
