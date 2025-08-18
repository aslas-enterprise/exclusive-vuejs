<template>
  <div class="favorites-page">
    <div class="favorites-header">
      <h1>My Favorites</h1>
      <p v-if="favorites.length > 0">
        You have {{ favorites.length }} favorite {{ favorites.length === 1 ? 'item' : 'items' }}
      </p>
      <p v-else>You haven't added any items to your favorites yet.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate size="64" color="primary" />
      <p>Loading your favorites...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <v-icon icon="mdi-alert-circle" size="64" color="error" />
      <p>{{ error }}</p>
      <v-btn @click="fetchFavorites" color="primary" variant="flat">
        Try Again
      </v-btn>
    </div>

    <!-- Empty State -->
    <div v-else-if="favorites.length === 0" class="empty-state">
      <v-icon icon="mdi-heart-outline" size="64" color="grey" />
      <p>No favorites yet</p>
      <p class="empty-subtitle">Start shopping and add items to your favorites!</p>
      <v-btn to="/products" color="primary" variant="flat" size="large">
        Browse Products
      </v-btn>
    </div>

    <!-- Favorites Grid -->
    <div v-else class="favorites-grid">
      <ItemCard
        v-for="favorite in favorites"
        :key="favorite.id"
        :item="{item: favorite.item}"
        :show-sale-tag="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useFavoritesStore } from '../../stores/modules/favorites/favorites.store';
import ItemCard from '../../components/ItemCard.vue';

const favoritesStore = useFavoritesStore();

// Computed properties
const favorites = computed(() => favoritesStore.favorites);
const loading = computed(() => favoritesStore.loading);
const error = computed(() => favoritesStore.error);

// Methods
const fetchFavorites = () => {
  favoritesStore.fetchFavorites();
};

// Lifecycle
onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.favorites-header {
  text-align: center;
  margin-bottom: 40px;
}

.favorites-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #000;
  margin: 0 0 16px 0;
}

.favorites-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-state p,
.error-state p,
.empty-state p {
  margin: 16px 0 0 0;
  font-size: 16px;
  color: #666;
}

.error-state p {
  color: #d32f2f;
  margin-bottom: 24px;
}

.empty-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .favorites-page {
    padding: 16px;
  }
  
  .favorites-header h1 {
    font-size: 24px;
  }
  
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
