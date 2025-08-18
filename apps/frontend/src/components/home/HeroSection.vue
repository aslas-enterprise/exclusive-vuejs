<template>
  <section class="hero-section">
    <v-container class="py-0">
      <v-row no-gutters>
        <!-- Categories Sidebar -->
        <v-col cols="12" md="3" class="categories-sidebar">
          <div class="categories-container">
            <h3 class="categories-title">Exclusive</h3>
            <ul class="categories-list">
              <li v-for="category in categories" :key="category.id" class="category-item">
                <span class="category-name">{{ category.name }}</span>
                <v-icon icon="mdi-chevron-right" size="16" class="category-arrow" />
              </li>
            </ul>
          </div>
        </v-col>

        <!-- Hero Banner -->
        <v-col cols="12" md="9" class="hero-banner">
          <div class="banner-container">
            <div class="banner-content">
              <h1 class="banner-title">iPhone 14 Series</h1>
              <p class="banner-subtitle">Up to 10% off Voucher</p>
              <v-btn 
                color="white" 
                variant="flat" 
                class="shop-now-btn"
                size="large"
              >
                Shop Now
                <v-icon icon="mdi-arrow-right" class="ms-2" />
              </v-btn>
            </div>
            <div class="banner-image">
              <img src="/src/assets/images/iphone-14-pro-max.png" alt="iPhone 14 Pro Max" />
            </div>
            <div class="banner-pagination">
              <div class="pagination-dot active"></div>
              <div class="pagination-dot"></div>
              <div class="pagination-dot"></div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const categories = [
  { id: 1, name: "Woman's Fashion" },
  { id: 2, name: "Men's Fashion" },
  { id: 3, name: "Electronics" },
  { id: 4, name: "Home & Lifestyle" },
  { id: 5, name: "Medicine" },
  { id: 6, name: "Sports & Outdoor" },
  { id: 7, name: "Baby's & Toys" },
  { id: 8, name: "Groceries & Pets" },
  { id: 9, name: "Health & Beauty" }
];
</script>

<style scoped>
.hero-section {
  background: #fff;
  padding: 40px 0;
}

.categories-sidebar {
  background: #fff;
  border-right: 1px solid #f0f0f0;
}

.categories-container {
  padding: 20px;
}

.categories-title {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin-bottom: 24px;
}

.categories-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f5f5f5;
}

.category-item:hover {
  background: #f8f8f8;
  padding-left: 8px;
}

.category-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.category-arrow {
  color: #999;
}

.hero-banner {
  background: #000;
  min-height: 400px;
  position: relative;
  overflow: hidden;
}

.banner-container {
  position: relative;
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  padding: 40px;
}

.banner-content {
  color: white;
  z-index: 2;
  position: relative;
  max-width: 300px;
}

.banner-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.1;
}

.banner-subtitle {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.shop-now-btn {
  color: #000 !important;
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 0px;
  text-transform: none;
}

.banner-image {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.banner-image img {
  max-width: 300px;
  height: auto;
}

.banner-pagination {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.pagination-dot {
  width: 12px;
  height: 12px;
  border-radius: 0px;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-dot.active {
  background: white;
}

/* Responsive Design */
@media (max-width: 960px) {
  .categories-sidebar {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .banner-container {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .banner-content {
    max-width: 100%;
    margin-bottom: 20px;
  }
  
  .banner-title {
    font-size: 32px;
  }
  
  .banner-image {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    margin-top: 20px;
  }
  
  .banner-image img {
    max-width: 200px;
  }
}

@media (max-width: 600px) {
  .hero-section {
    padding: 20px 0;
  }
  
  .banner-title {
    font-size: 24px;
  }
  
  .banner-subtitle {
    font-size: 16px;
  }
  
  .shop-now-btn {
    padding: 12px 24px;
  }
}
</style>
