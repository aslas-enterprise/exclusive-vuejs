<script setup lang="ts">
import { computed } from 'vue';
import BrandLogo from '@components/BrandLogo.vue';
import CartBasket from './CartBasket.vue';
import { useAuthStore } from '../../stores/index';
import UserDropdown from './UserDropdown.vue';

const authStore = useAuthStore();

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <header class="w-full bg-white border-b">
    <v-container class="py-3" >
      <div class="d-flex align-center w-100">
        <div class="me-6"><BrandLogo /></div>

        <nav class="d-flex align-center justify-center flex-grow-1">
          <v-btn to="/" variant="text" class="nav-link mx-4">{{ $t('nav.home') }}</v-btn>
          <v-btn to="/products" variant="text" class="nav-link mx-4">Products</v-btn>
          <v-btn to="/contact" variant="text" class="nav-link mx-4">{{ $t('nav.contact') }}</v-btn>
          <v-btn to="/about" variant="text" class="nav-link mx-4">{{ $t('nav.about') }}</v-btn>
        </nav>

        <v-text-field
          class="ms-auto search-field me-4"
          :placeholder="String($t('nav.searchPlaceholder'))"
          density="comfortable"
          variant="solo-filled"
          hide-details
        >
          <template #append-inner>
            <v-icon icon="mdi-magnify" size="16" class="search-icon" />
          </template>
        </v-text-field>

        <!-- Cart Basket -->
        <div class="me-4">
          <CartBasket />
        </div>

        <!-- User Authentication Section -->
        <div v-if="!isAuthenticated" class="d-flex align-center">
          <v-btn to="/login" variant="text" class="nav-link me-2">Login</v-btn>
          <v-btn to="/signup" color="primary" variant="flat" class="btn-cap nav-link">Sign Up</v-btn>
        </div>

        <!-- User Profile Section -->
        <UserDropdown v-else />
      </div>
    </v-container>
  </header>
</template>

.style1{}
<style scoped>
.nav-link {
  color: rgb(var(--v-theme-secondary)) !important;
  text-transform: none;
  border-radius: 6px !important;
}
.nav-link:hover,
.nav-link:focus-visible {
  color: rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-secondary)) !important;
}
.search-field {
  max-width: 243px;
}
.search-field :deep(.v-field) {
  border-radius: 0px;
  background: #F5F5F5;
  min-height: 38px;
  box-shadow: none;
  height: 38px;
}
.search-field :deep(input) {
  font-size: 12px;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 4px;
  padding-bottom: 12px;
}
.search-icon {
  opacity: 0.6;
  margin-top: -6px;
}

/* User Menu Styles */
.user-menu-btn {
  color: rgb(var(--v-theme-secondary)) !important;
  text-transform: none;
  padding: 8px 12px;
}

.user-menu-btn:hover {
  color: rgb(var(--v-theme-primary)) !important;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-secondary));
}

.user-dropdown {
  border-radius: 0px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.user-info-item {
  padding: 16px;
}

.dropdown-item {
  cursor: pointer;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgb(var(--v-theme-primary));
  color: white !important;
}

.dropdown-item:hover .v-list-item-title {
  color: white !important;
}

.dropdown-item:hover .v-icon {
  color: white !important;
}

/* Chevron rotation animation */
.chevron-icon {
  transition: transform 0.3s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.btn-cap {
  text-transform: none;
  border-radius: 6px !important;
}

</style>


