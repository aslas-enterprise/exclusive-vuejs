<template>
  <div class="products-header">
    <v-container>
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-subtitle">{{ subtitle }}</p>
    </v-container>
  </div>
</template>

<script setup lang="ts">
interface ProductsHeaderProps {
  title?: string;
  subtitle?: string;
}

const props = withDefaults(defineProps<ProductsHeaderProps>(), {
  title: 'All Products',
  subtitle: 'Discover our complete collection of products'
});
</script>

<style scoped>
.products-header {
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

@media (max-width: 960px) {
  .page-title {
    font-size: 28px;
  }
}

@media (max-width: 600px) {
  .products-header {
    padding: 30px 0;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
