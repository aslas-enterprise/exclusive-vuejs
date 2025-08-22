<template>
  <div class="products-grid-section">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4">Loading products...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <v-icon icon="mdi-alert" size="64" color="error" />
      <p class="mt-4">{{ error }}</p>
      <v-btn @click="$emit('retry')" color="primary" variant="flat" class="mt-4">
        Try Again
      </v-btn>
    </div>

    <!-- Products Grid -->
    <div  v-else-if="products.length > 0">
      <!-- Results Summary -->
      <div class="results-summary">
        <p class="results-text">
          Showing {{ paginationInfo.startIndex + 1 }}-{{ paginationInfo.endIndex }} 
          of {{ paginationInfo.total }} products
        </p>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        <ItemCard
          v-for="product in products"
          :key="product.id"
          :item="product"
          :show-sale-tag="true"
        />
      </div>

      <!-- Pagination -->
      <div class="pagination-section">
        <v-pagination
          v-model="currentPage"
          :length="paginationInfo.totalPages"
          :total-visible="7"
          @update:model-value="handlePageChange"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <v-icon icon="mdi-package-variant" size="64" color="grey" />
      <p class="mt-4">No products found matching your criteria</p>
      <v-btn @click="$emit('clearFilters')" color="primary" variant="flat" class="mt-4">
        Clear Filters
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ItemCard from '../../../components/ItemCard.vue';

interface Product {
  id: string;
  name: string;
  [key: string]: any;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductsGridProps {
  products: Product[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

const props = defineProps<ProductsGridProps>();

const emit = defineEmits<{
  pageChange: [page: number];
  retry: [];
  clearFilters: [];
}>();

// Local state
const currentPage = ref(props.pagination?.page || 1);

// Computed properties
const paginationInfo = computed(() => {
  const { page, limit, total } = props.pagination;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);
  
  return {
    startIndex,
    endIndex,
    total,
    totalPages: props.pagination.totalPages
  };
});

// Methods
const handlePageChange = (page: number) => {
  currentPage.value = page;
  emit('pageChange', page);
};

// Watch for pagination changes from parent
watch(() => props.pagination?.page, (newPage) => {
  currentPage.value = newPage;
});

// Watch for route changes to sync page parameter
watch(() => window.location.search, () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  if (pageParam) {
    currentPage.value = parseInt(pageParam);
  }
});
</script>

<style scoped>
.products-grid-section {
padding: 24px 24px 60px 24px;
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
  font-size: 16px;
  color: #666;
  margin: 0;
}

.results-summary {
  margin-bottom: 24px;
}

.results-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
