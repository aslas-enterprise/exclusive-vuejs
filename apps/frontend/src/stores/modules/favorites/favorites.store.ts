import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { favoritesApi, FavoriteItem, FavoriteStatus } from '../../apis/favorites.api';
import { useAuthStore } from '../auth/auth.store';

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<FavoriteItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Computed properties
  const favoritesCount = computed(() => favorites.value.length);
  const isLoggedIn = computed(() => authStore.isAuthenticated);

  // Actions
  const fetchFavorites = async () => {
    if (!authStore.isAuthenticated) {
      favorites.value = [];
      return;
    }

    try {
      loading.value = true;
      error.value = null;
      const data = await favoritesApi.getUserFavorites();
      favorites.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch favorites';
      console.error('Error fetching favorites:', err);
    } finally {
      loading.value = false;
    }
  };

  const addToFavorites = async (itemId: string) => {
    if (!authStore.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      loading.value = true;
      error.value = null;
      const newFavorite = await favoritesApi.addToFavorites(itemId);
      favorites.value.unshift(newFavorite);
      return newFavorite;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add to favorites';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removeFromFavorites = async (itemId: string) => {
    if (!authStore.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      loading.value = true;
      error.value = null;
      await favoritesApi.removeFromFavorites(itemId);
      favorites.value = favorites.value.filter(fav => fav.item.id !== itemId);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove from favorites';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleFavorite = async (itemId: string) => {
    const isFavorited = favorites.value.some(fav => fav.item.id === itemId);
    
    if (isFavorited) {
      await removeFromFavorites(itemId);
    } else {
      await addToFavorites(itemId);
    }
  };

  const checkFavoriteStatus = async (itemId: string): Promise<boolean> => {
    if (!authStore.isAuthenticated) {
      return false;
    }

    try {
      const status = await favoritesApi.checkFavoriteStatus(itemId);
      return status.isFavorited;
    } catch (err) {
      console.error('Error checking favorite status:', err);
      return false;
    }
  };

  const isItemFavorited = (itemId: string): boolean => {
    return favorites.value.some(fav => fav.item.id === itemId);
  };

  // Check favorite status for multiple items and update local state
  const checkItemsFavoriteStatus = async (itemIds: string[]) => {
    if (!authStore.isAuthenticated || itemIds.length === 0) {
      return;
    }

    try {
      // Check status for each item
      const statusPromises = itemIds.map(async (itemId) => {
        try {
          const status = await favoritesApi.checkFavoriteStatus(itemId);
          return { itemId, isFavorited: status.isFavorited };
        } catch (err) {
          console.error(`Error checking favorite status for item ${itemId}:`, err);
          return { itemId, isFavorited: false };
        }
      });

      const results = await Promise.all(statusPromises);
      
      // Update local favorites state based on results
      results.forEach(({ itemId, isFavorited }) => {
        if (isFavorited) {
          // If item is favorited but not in local state, add it
          const existingItem = favorites.value.find(fav => fav.item.id === itemId);
          if (!existingItem) {
            // We need to fetch the item details to add it to favorites
            // For now, we'll just mark it as favorited in a separate state
            // This will be handled by the individual ItemCard components
          }
        }
      });
    } catch (err) {
      console.error('Error checking items favorite status:', err);
    }
  };

  const clearFavorites = () => {
    favorites.value = [];
    error.value = null;
  };

  return {
    // State
    favorites,
    loading,
    error,
    
    // Computed
    favoritesCount,
    isLoggedIn,
    
    // Actions
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    checkFavoriteStatus,
    checkItemsFavoriteStatus,
    isItemFavorited,
    clearFavorites,
  };
});
