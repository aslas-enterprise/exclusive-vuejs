<template>
  <div class="products-page">
    <!-- Page Header -->
    <ProductsHeader />
    
    <!-- Filters Section -->
    <ProductsFilters 
      :categories="categories"
      @filters-changed="handleFiltersChanged"
      @clear-filters="handleClearFilters"
      ref="filtersRef"
    />
    
    <!-- Products Section -->
    <ProductsGrid
      :products="products"
      :pagination="pagination"
      :loading="loading"
      :error="error"
      @page-change="handlePageChange"
      @retry="fetchProducts"
      @clear-filters="handleClearFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { IItems, useItemsStore } from '../../stores/modules/items';
import { ICategories, useCategoriesStore } from '../../stores/modules/categories';
import { useFavoritesStore } from '../../stores/modules/favorites/favorites.store';
import ProductsHeader from './components/ProductsHeader.vue';
import ProductsFilters from './components/ProductsFilters.vue';
import ProductsGrid from './components/ProductsGrid.vue';

// Stores
const itemsStore = useItemsStore();
const categoriesStore = useCategoriesStore();
const favoritesStore = useFavoritesStore();

// Refs
const filtersRef = ref();

// Reactive state
const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const products = computed(() => {
  return  itemsStore.items as unknown as IItems.Item[] || [];
});
const categories = computed(() => {
  return categoriesStore.categories as unknown as ICategories.Category[] || [];
});
const pagination = computed(() => {
  const paginationData = itemsStore.pagination as unknown as IItems.ItemsResponse;
  if (!paginationData) {
    return {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    };
  }
  return {
    total: paginationData.total || 0,
    page: paginationData.page || 1,
    limit: paginationData.limit || 10,
    totalPages: paginationData.totalPages || 0
  };
});

// Methods
const fetchProducts = async (filters?: any) => {
  try {
    loading.value = true;
    error.value = null;
    
    let queryParams: any = {};
    
    if (filters) {
      // Build query parameters
      queryParams = { ...filters };
      
      // Remove empty values and priceRange (already processed)
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined || key === 'priceRange') {
          delete queryParams[key];
        }
      });
    }
    
    const result = await itemsStore.fetchItems(queryParams);
    console.log('Products loaded:', result);
    console.log('Store items after fetch:', itemsStore.items?.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch products';
    console.error('Error fetching products:', err);
  } finally {
    loading.value = false;
  }
};

const handleFiltersChanged = (filters: any) => {
  fetchProducts(filters);
};

const handleClearFilters = () => {
  if (filtersRef.value) {
    filtersRef.value.clearFilters();
  }
  fetchProducts();
};

const handlePageChange = (page: number) => {
  if (filtersRef.value) {
    filtersRef.value.filters.page = page;
    // Update URL query parameter for page
    const newFilters = { ...filtersRef.value.filters };
    filtersRef.value.updateQueryParams(newFilters);
    fetchProducts(newFilters);
  }
};

// Watch for products changes to check favorite status
watch(products, async (newProducts) => {
  if (newProducts && newProducts.length > 0 && favoritesStore.isLoggedIn) {
    // Extract item IDs from products
    const itemIds = newProducts.map(product => product.id).filter(Boolean);
    if (itemIds.length > 0) {
      // Check favorite status for all items
      for (const itemId of itemIds) {
        await favoritesStore.checkFavoriteStatus(itemId);
      }
    }
  }
}, { immediate: false });

// Lifecycle
onMounted(async () => {
  try {
    // Fetch categories for filter dropdown
    await categoriesStore.fetchCategories();
    
    // Fetch initial products
    await fetchProducts();
    
    // Debug: Check what's in the store
    console.log('Store state after fetch:');
    console.log('Items:', itemsStore.items?.value);
    console.log('Categories:', categoriesStore.categories?.value);
    console.log('Products computed:', products.value);
    
    // If no products loaded, try to debug
    if (!products.value || products.value.length === 0) {
      console.log('No products loaded, checking store state:');
      console.log('ItemsStore items:', itemsStore.items?.value);
      console.log('ItemsStore loading:', itemsStore.loading?.value);
      console.log('ItemsStore error:', itemsStore.error?.value);
    }
    
    // Check favorite status for initial products if user is logged in
    if (products.value && products.value.length > 0 && favoritesStore.isLoggedIn) {
      const itemIds = products.value.map(product => product.id).filter(Boolean);
    
      if (itemIds.length > 0) {
        for (const itemId of itemIds) {
          await favoritesStore.checkFavoriteStatus(itemId);
        }
      }
    }
  } catch (err) {
    error.value = 'Failed to initialize page';
    console.error('Error in ProductsPage onMounted:', err);
  }
});
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f8f9fa;
}
</style>
