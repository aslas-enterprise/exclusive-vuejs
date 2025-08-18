import { defineStore } from 'pinia';
import { itemsApi } from '../../apis/items.api';
import type { Item, ItemQueryParams } from './items.interface';

export const useItemsStore = defineStore('items', {
  state: () => ({
    items: [] as Item[],
    featuredItems: [] as Item[],
    bestSellingItems: [] as Item[],
    loading: false,
    error: null as string | null,
    selectedItem: null as Item | null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  }),

  getters: {
    activeItems: (state) => state.items.filter(item => item.isActive),
    itemsOnSale: (state) => state.items.filter(item => item.isOnSale),
    itemsByRating: (state) => (minRating: number) => 
      state.items.filter(item => (item.averageRating || 0) >= minRating),
    getItemById: (state) => (id: string) => state.items.find(item => item.id === id),
    getItemsByCategory: (state) => (categoryId: string) => 
      state.items.filter(item => item.categoryId === categoryId),
    getItemsBySubcategory: (state) => (subcategoryId: string) => 
      state.items.filter(item => item.subcategoryId === subcategoryId),
  },

  actions: {
    async fetchItems(params?: ItemQueryParams) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await itemsApi.getItems(params);
        this.items = response.items;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
        
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch items';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchFeaturedItems() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await itemsApi.getFeaturedItems();
        this.featuredItems = response;
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch featured items';
        throw error;
      } finally {
        this.loading = false;
      }
    },

      async fetchBestSellingItems() {
    try {
      this.loading = true;
      this.error = null;
      
      const response = await itemsApi.getBestSellingItems();
      this.bestSellingItems = response.slice(0, 4); // Get top 4
      return this.bestSellingItems;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to fetch best selling items';
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async fetchTopRatedItems(minRating: number = 4, limit: number = 10) {
    try {
      this.loading = true;
      this.error = null;
      
      const response = await itemsApi.getTopRatedItems(minRating, limit);
      return response;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to fetch top rated items';
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async fetchNewArrivalItems(limit: number = 8) {
    try {
      this.loading = true;
      this.error = null;
      
      const response = await itemsApi.getNewArrivalItems(limit);
      return response;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to fetch new arrival items';
      throw error;
    } finally {
      this.loading = false;
    }
  },

    async fetchItemById(id: string) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await itemsApi.getItemById(id);
        this.selectedItem = response;
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch item';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchItemsByCategory(categoryId: string, params?: Omit<ItemQueryParams, 'categoryId'>) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await itemsApi.getItemsByCategory(categoryId, params);
        this.items = response.items;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
        
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch items by category';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchItemsBySubcategory(subcategoryId: string, params?: Omit<ItemQueryParams, 'subcategoryId'>) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await itemsApi.getItemsBySubcategory(subcategoryId, params);
        this.items = response.items;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
        
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch items by subcategory';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchItems(query: string, params?: Omit<ItemQueryParams, 'search'>) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await itemsApi.searchItems({ ...params, search: query });
        this.items = response.items;
        this.pagination = {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        };
        
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to search items';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setSelectedItem(item: Item | null) {
      this.selectedItem = item;
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.items = [];
      this.featuredItems = [];
      this.bestSellingItems = [];
      this.loading = false;
      this.error = null;
      this.selectedItem = null;
      this.pagination = {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    },
  },
});
