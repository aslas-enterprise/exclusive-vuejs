<template>
  <div class="products-filters">
    <v-container>
      <v-card class="filters-card">
        <v-card-title class="filters-title">
          <v-icon icon="mdi-filter" class="mr-2" />
          Filters
        </v-card-title>
        
        <v-card-text>
          <v-row>
            <!-- Search Filter -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="filters.search"
                label="Search Products"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>

            <!-- Category Filter -->
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.category"
                :items="categories"
                item-title="name"
                item-value="slug"
                label="Category"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>

            <!-- Price Range Filter -->
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.priceRange"
                :items="priceRanges"
                item-title="label"
                item-value="value"
                label="Price Range"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>

            <!-- Rating Filter -->
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.minRating"
                :items="ratingOptions"
                item-title="label"
                item-value="value"
                label="Min Rating"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="applyFilters"
              />
            </v-col>
          </v-row>

          <!-- Additional Filters Row -->
          <v-row class="mt-2">
            <!-- Sort By -->
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.sortBy"
                :items="sortOptions"
                item-title="label"
                item-value="value"
                label="Sort By"
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>

            <!-- Sort Order -->
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.sortOrder"
                :items="sortOrderOptions"
                item-title="label"
                item-value="value"
                label="Sort Order"
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>

            <!-- Items Per Page -->
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.limit"
                :items="itemsPerPageOptions"
                item-title="label"
                item-value="value"
                label="Items Per Page"
                variant="outlined"
                density="compact"
                @update:model-value="applyFilters"
              />
            </v-col>

            <!-- Clear Filters -->
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-btn
                color="secondary"
                variant="outlined"
                @click="clearFilters"
                class="clear-filters-btn"
              >
                <v-icon icon="mdi-refresh" class="mr-2" />
                Clear Filters
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductsFiltersProps {
  categories: Category[];
}

const props = defineProps<ProductsFiltersProps>();

const emit = defineEmits<{
  filtersChanged: [filters: any];
  clearFilters: [];
}>();

// Router
const route = useRoute();
const router = useRouter();

// Filters
const filters = ref({
  search: '',
  category: '',
  priceRange: '',
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  minRating: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 12
});

// Initialize filters from URL query parameters
const initializeFiltersFromQuery = () => {
  const query = route.query;
  
  if (query.search) filters.value.search = query.search as string;
  if (query.category) filters.value.category = query.category as string;
  if (query.priceRange) filters.value.priceRange = query.priceRange as string;
  if (query.minRating) filters.value.minRating = query.minRating as string;
  if (query.sortBy) filters.value.sortBy = query.sortBy as string;
  if (query.sortOrder) filters.value.sortOrder = query.sortOrder as string;
  if (query.page) filters.value.page = parseInt(query.page as string) || 1;
  if (query.limit) filters.value.limit = parseInt(query.limit as string) || 12;
};

// Update URL query parameters
const updateQueryParams = (newFilters: any) => {
  const query: any = {};
  
  Object.keys(newFilters).forEach(key => {
    if (newFilters[key] !== '' && newFilters[key] !== null && newFilters[key] !== undefined) {
      query[key] = newFilters[key];
    }
  });
  
  // Remove page from URL if it's 1 (default)
  if (query.page === 1) {
    delete query.page;
  }
  
  // Remove limit from URL if it's 12 (default)
  if (query.limit === 12) {
    delete query.limit;
  }
  
  router.replace({ query });
};

// Filter options
const priceRanges = [
  { label: 'Under $50', value: '0-50' },
  { label: '$50 - $100', value: '50-100' },
  { label: '$100 - $200', value: '100-200' },
  { label: '$200 - $500', value: '200-500' },
  { label: 'Over $500', value: '500+' }
];

const ratingOptions = [
  { label: '4+ Stars', value: 4 },
  { label: '3+ Stars', value: 3 },
  { label: '2+ Stars', value: 2 }
];

const sortOptions = [
  { label: 'Newest First', value: 'createdAt' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Price Low to High', value: 'price' },
  { label: 'Price High to Low', value: 'price' },
  { label: 'Highest Rated', value: 'rating' }
];

const sortOrderOptions = [
  { label: 'Descending', value: 'desc' },
  { label: 'Ascending', value: 'asc' }
];

const itemsPerPageOptions = [
  { label: '12 per page', value: 12 },
  { label: '24 per page', value: 24 },
  { label: '48 per page', value: 48 }
];

// Methods
const applyFilters = () => {
  filters.value.page = 1; // Reset to first page when filters change
  const newFilters = { ...filters.value };
  
  // Process price range before sending to backend
  if (newFilters.priceRange) {
    const [min, max] = newFilters.priceRange.split('-');
    if (max === '+') {
      newFilters.minPrice = parseInt(min);
    } else {
      newFilters.minPrice = parseInt(min);
      newFilters.maxPrice = parseInt(max);
    }
    // Set priceRange to empty string as it's not a valid backend parameter
    newFilters.priceRange = '';
  }
  
  updateQueryParams(newFilters);
  emit('filtersChanged', newFilters);
};

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    priceRange: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  };
  // Clear URL query parameters
  router.replace({ query: {} });
  emit('clearFilters');
};

// Watch for filter changes
watch(filters, () => {
  // Debounce filter changes to avoid too many API calls
  clearTimeout((window as any).filterTimeout);
  (window as any).filterTimeout = setTimeout(() => {
    applyFilters();
  }, 300);
}, { deep: true });

// Watch for route query changes (when user navigates back/forward)
watch(() => route.query, () => {
  initializeFiltersFromQuery();
}, { deep: true });

// Lifecycle
onMounted(() => {
  initializeFiltersFromQuery();
});

// Expose filters for external access
defineExpose({
  filters,
  applyFilters,
  clearFilters,
  updateQueryParams
});
</script>

<style scoped>
.products-filters {
  padding: 24px 0;
}

.filters-card {
  border-radius: 0px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters-title {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  padding: 20px 20px 0 20px;
}

.filters-card .v-card-text {
  padding: 0 20px 20px 20px;
}

.clear-filters-btn {
  width: 100%;
}

@media (max-width: 600px) {
  .clear-filters-btn {
    margin-top: 16px;
  }
}
</style>
