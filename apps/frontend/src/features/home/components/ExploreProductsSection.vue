<template>
  <section class="explore-products-section">
    <v-container>
      <!-- Section Header -->
      <div class="section-header">
        <div class="header-content">
          <div class="red-bar"></div>
          <h2 class="section-title">Our Products Explore Our Products</h2>
        </div>
      </div>

      <!-- Products Carousel -->
      <div class="products-carousel">
        <v-btn 
          icon="mdi-chevron-left" 
          variant="outlined" 
          class="carousel-nav-btn prev-btn"
          size="large"
        />
        
        <div class="products-container">
         
          <ItemCard 
            v-for="product in exploreItems" 
            :key="product.id" 
            :item="{item: product}"
            :show-sale-tag="true"
          />
        </div>

        <v-btn 
          icon="mdi-chevron-right" 
          variant="outlined" 
          class="carousel-nav-btn next-btn"
          size="large"
        />
      </div>

      <!-- View All Button -->
      <div class="view-all-container">
        <v-btn 
          color="error" 
          variant="flat" 
          size="large"
          class="view-all-btn"
        >
          View All Products
        </v-btn>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useItemsStore } from '../../../stores/modules/items';
import ItemCard from '../../../components/ItemCard.vue';

const itemsStore = useItemsStore();

// Fetch featured items on component mount
onMounted(async () => {
  try {
    await itemsStore.fetchFeaturedItems();
  } catch (error) {
    console.error('Failed to fetch featured items:', error);
  }
});

// Get featured items from store
const exploreItems = computed(() => itemsStore.featuredItems);


// Loading state
const loading = computed(() => itemsStore.loading);

// Error state
const error = computed(() => itemsStore.error);
</script>

<style scoped>
.explore-products-section {
  background: #fff;
  padding: 60px 0;
}

.section-header {
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.red-bar {
  width: 4px;
  height: 40px;
  background: #DB4444;
  border-radius: 2px;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.products-carousel {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.carousel-nav-btn {
  border-color: #ddd;
  color: #666;
  flex-shrink: 0;
  border-radius: 8px;
}

.carousel-nav-btn:hover {
  border-color: #000;
  color: #000;
}

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  flex-grow: 1;
}

.product-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 0px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.product-image {
  position: relative;
  height: 200px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.new-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #00FF66;
  color: white;
  padding: 4px 8px;
  border-radius: 0px;
  font-size: 12px;
  font-weight: 600;
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stars {
  display: flex;
  gap: 2px;
}

.rating-count {
  font-size: 12px;
  color: #666;
}

.product-price {
  margin-bottom: 16px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #DB4444;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  color: #666;
  min-width: 32px;
  height: 32px;
}

.action-btn:hover {
  color: #000;
}

.add-to-cart-btn {
  font-size: 12px;
  padding: 8px 16px;
  height: 32px;
  text-transform: none;
}

.view-all-container {
  text-align: center;
}

.view-all-btn {
  padding: 14px 32px;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px !important;
}

/* Responsive Design */
@media (max-width: 960px) {
  .products-container {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 600px) {
  .explore-products-section {
    padding: 40px 0;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .products-container {
    grid-template-columns: 1fr;
  }
  
  .carousel-nav-btn {
    display: none;
  }
}
</style>
