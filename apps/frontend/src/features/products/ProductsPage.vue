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
import { useItemsStore } from '../../stores/modules/items';
import { useCategoriesStore } from '../../stores/modules/categories';
import { useFavoritesStore } from '../../stores/modules/favorites/favorites.store';
import ProductsHeader from './components/ProductsHeader.vue';
import ProductsFilters from './components/ProductsFilters.vue';
import ProductsGrid from './components/ProductsGrid.vue';

// Stores
const itemsStore = useItemsStore();
const categoriesStore = useCategoriesStore();
const favoritesStore = useFavoritesStore();

// Debug store state
console.log('ItemsStore state:', itemsStore.$state);
console.log('CategoriesStore state:', categoriesStore.$state);

// Refs
const filtersRef = ref();

// Reactive state
const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const products = computed(() => {
  console.log('Products computed - itemsStore.items:', itemsStore.items);
  return itemsStore.items;
});
const categories = computed(() => {
  console.log('Categories computed - categoriesStore.categories:', categoriesStore.categories);
  return categoriesStore.categories;
});
const pagination = computed(() => {
  console.log('Pagination computed - itemsStore.pagination:', itemsStore.pagination);
  return itemsStore.pagination;
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
    
    console.log('Fetching products with params:', queryParams);
    const result = await itemsStore.fetchItems(queryParams);
    console.log('Products fetch result:', result);
  } catch (err) {
    console.error('Error fetching products:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch products';
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
    const itemIds = newProducts.map(product => product.id || product.item?.id).filter(Boolean);
    if (itemIds.length > 0) {
      // Check favorite status for all items
      await favoritesStore.checkItemsFavoriteStatus(itemIds);
    }
  }
}, { immediate: false });

// Lifecycle
onMounted(async () => {
  try {
    console.log('ProductsPage mounted, fetching data...');
    // Fetch categories for filter dropdown
    await categoriesStore.fetchCategories();
    console.log('Categories fetched:', categories.value);
    // Fetch initial products
    await fetchProducts();
    console.log('Products fetched:', products.value);
    
    // Check favorite status for initial products if user is logged in
    if (products.value && products.value.length > 0 && favoritesStore.isLoggedIn) {
      const itemIds = products.value.map(product => product.id || product.item?.id).filter(Boolean);
      if (itemIds.length > 0) {
        await favoritesStore.checkItemsFavoriteStatus(itemIds);
      }
    }
  } catch (err) {
    console.error('Error in ProductsPage onMounted:', err);
    error.value = 'Failed to initialize page';
  }
});
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f8f9fa;
}
</style>
