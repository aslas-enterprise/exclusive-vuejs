<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import TopPromoBar from '@components/layout/TopPromoBar.vue';
import SiteHeader from '@components/layout/SiteHeader.vue';
import SiteFooter from '@components/layout/SiteFooter.vue';
</script>

<template>
  <v-app>
    <TopPromoBar />
    <SiteHeader />
    <v-main>
      <RouterView />
    </v-main>
    <SiteFooter />
  </v-app>
  
</template>

<style scoped>
</style>
