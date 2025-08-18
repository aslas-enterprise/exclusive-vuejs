import { defineStore } from 'pinia';
import { categoriesApi } from '../../apis/categories.api';
import type { Category, Subcategory, CategoryQueryParams } from './categories.interface';

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    subcategories: [] as Subcategory[],
    loading: false,
    error: null as string | null,
    selectedCategory: null as Category | null,
    selectedSubcategory: null as Subcategory | null,
  }),

  getters: {
    activeCategories: (state) => state.categories.filter(cat => cat.isActive),
    categoriesWithSubcategories: (state) => state.categories.filter(cat => cat.subcategories && cat.subcategories.length > 0),
    getCategoryById: (state) => (id: string) => state.categories.find(cat => cat.id === id),
    getSubcategoryById: (state) => (id: string) => state.subcategories.find(sub => sub.id === id),
    getSubcategoriesByCategory: (state) => (categoryId: string) => 
      state.subcategories.filter(sub => sub.categoryId === categoryId),
  },

  actions: {
    async fetchCategories(params?: CategoryQueryParams) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await categoriesApi.getCategories(params);
        this.categories = response;
        
        // Extract all subcategories from categories
        this.subcategories = response.reduce((acc: Subcategory[], category) => {
          if (category.subcategories) {
            acc.push(...category.subcategories);
          }
          return acc;
        }, []);
        
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch categories';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCategoryById(id: string) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await categoriesApi.getCategoryById(id);
        this.selectedCategory = response;
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch category';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchSubcategoryById(id: string) {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await categoriesApi.getSubcategoryById(id);
        this.selectedSubcategory = response;
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch subcategory';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setSelectedCategory(category: Category | null) {
      this.selectedCategory = category;
    },

    setSelectedSubcategory(subcategory: Subcategory | null) {
      this.selectedSubcategory = subcategory;
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.categories = [];
      this.subcategories = [];
      this.loading = false;
      this.error = null;
      this.selectedCategory = null;
      this.selectedSubcategory = null;
    },
  },
});
