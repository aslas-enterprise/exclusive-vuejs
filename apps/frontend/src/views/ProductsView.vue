<template>
  <ProductsPage />
</template>

<script setup lang="ts">
import ProductsPage from '../features/products/ProductsPage.vue';
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #e0e0e0;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #000;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.filters-section {
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

.products-section {
  padding: 24px 0 60px 0;
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
  .page-title {
    font-size: 28px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 600px) {
  .page-header {
    padding: 30px 0;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .filters-section {
    padding: 16px 0;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .clear-filters-btn {
    margin-top: 16px;
  }
}
</style>
