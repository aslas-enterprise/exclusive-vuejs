<template>
  <div class="item-card">
    <div class="item-image">
      <!-- Image Slideshow -->
      <div v-if="hasMultipleImages" class="image-slideshow">
        <img 
          :src="currentImage.url" 
          :alt="currentImage.altText || item.name || item.item?.name" 
          class="slideshow-image"
        />
        

        
        <!-- Image Indicators -->
        <div v-if="hasMultipleImages" class="image-indicators">
          <button
            v-for="(image, index) in itemImages"
            :key="index"
            @click="goToImage(index)"
            class="indicator-dot"
            :class="{ active: currentImageIndex === index }"
            type="button"
          />
        </div>
      </div>
      
      <!-- Single Image Display -->
      <img 
        v-else
        :src="getPrimaryImage(item)" 
        :alt="item.name || item.item?.name" 
        class="single-image"
      />
      
      <div v-if="showSaleTag && isOnSale" class="sale-badge">Sale</div>
    </div>
    <div class="item-info">
      <h3 class="item-name">{{ item.name || item.item?.name }}</h3>
      <div class="item-rating">
        <div class="stars">
          <v-icon 
            v-for="star in 5" 
            :key="star" 
            icon="mdi-star" 
            size="16" 
            :color="star <= getAverageRating(item.item) ? '#FFD700' : '#E0E0E0'"
          />
        </div>
        <span class="rating-count">({{ getReviewCount(item.item) }} reviews)</span>
      </div>
 
      <div class="item-price">
        <span v-if="isOnSale" class="current-price">${{ item.item.salePrice || getCurrentPrice(item) }}</span>
        <span v-else class="current-price">${{ item.item.currentPrice || getCurrentPrice(item) }}</span>
        <span v-if="isOnSale" class="original-price">${{ item.item.currentPrice || getOriginalPrice(item) }}</span>
      </div>
      <div class="item-actions">
        <v-btn 
          :icon="isFavorited ? 'mdi-heart' : 'mdi-heart-outline'" 
          variant="text" 
          size="small" 
          class="action-btn favorite-btn"
          :class="{ 'favorited': isFavorited }"
          @click="handleFavoriteClick"
          :loading="favoriteLoading"
        />
        <v-btn 
          icon="mdi-eye" 
          variant="text" 
          size="small" 
          class="action-btn"
          @click="openItemModal"
        />
        <v-btn 
          color="primary" 
          variant="flat" 
          size="small"
          class="add-to-cart-btn"
        >
          Add To Cart
        </v-btn>
      </div>
    </div>
  </div>

  <!-- Item Modal -->
  <ItemModal
    v-model="showItemModal"
    :item="item"
    @add-to-cart="handleAddToCart"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFavoritesStore } from '../stores/modules/favorites/favorites.store';
import ItemModal from './ItemModal.vue';

interface ItemCardProps {
  item: any;
  showSaleTag?: boolean;
}

const props = withDefaults(defineProps<ItemCardProps>(), {
  showSaleTag: true
});

const router = useRouter();
const favoritesStore = useFavoritesStore();

// Slideshow state
const currentImageIndex = ref(0);
const favoriteLoading = ref(false);
const localFavoriteStatus = ref(false);
const showItemModal = ref(false);
let autoSlideInterval: ReturnType<typeof setInterval> | null = null;

// Computed properties
const isOnSale = computed(() => {
  // Check if the API provides computed isOnSale
  if (props.item.isOnSale !== undefined) {
    return props.item.isOnSale;
  }
  // Fallback to price comparison
  const currentPrice = getCurrentPrice(props.item);
  const originalPrice = getOriginalPrice(props.item);
  return currentPrice < originalPrice && currentPrice > 0;
});

const itemImages = computed(() => {
  return props.item.images || props.item.item?.images || [];
});

const hasMultipleImages = computed(() => {
  return itemImages.value.length > 1;
});

const currentImage = computed(() => {
  if (itemImages.value.length > 0) {
    return itemImages.value[currentImageIndex.value];
  }
  return { url: 'https://picsum.photos/400/300?random=16', altText: props.item.name || props.item.item?.name };
});

// Favorite functionality
const isFavorited = computed(() => {
  // First check local state, then fallback to store
  return localFavoriteStatus.value || favoritesStore.isItemFavorited(props.item.id || props.item.item?.id);
});

// Check favorite status for this item
const checkFavoriteStatus = async () => {
  if (!favoritesStore.isLoggedIn) {
    localFavoriteStatus.value = false;
    return;
  }

  try {
    const itemId = props.item.id || props.item.item?.id;
    const status = await favoritesStore.checkFavoriteStatus(itemId);
    localFavoriteStatus.value = status;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    localFavoriteStatus.value = false;
  }
};

// Favorite click handler
const handleFavoriteClick = async () => {
  if (!favoritesStore.isLoggedIn) {
    // Redirect to login page
    router.push('/login');
    return;
  }

  try {
    favoriteLoading.value = true;
    const itemId = props.item.id || props.item.item?.id;
    await favoritesStore.toggleFavorite(itemId);
    // Update local state after toggle
    localFavoriteStatus.value = !localFavoriteStatus.value;
  } catch (error) {
    console.error('Error toggling favorite:', error);
  } finally {
    favoriteLoading.value = false;
  }
};

const openItemModal = () => {
  showItemModal.value = true;
};

const handleAddToCart = (item: any, quantity: number) => {
  // TODO: Implement add to cart functionality
  console.log('Adding to cart:', item, quantity);
  showItemModal.value = false;
};

// Slideshow functions
const nextImage = () => {
  if (hasMultipleImages.value) {
    currentImageIndex.value = (currentImageIndex.value + 1) % itemImages.value.length;
  }
};

const previousImage = () => {
  if (hasMultipleImages.value) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? itemImages.value.length - 1 
      : currentImageIndex.value - 1;
  }
};

const goToImage = (index: number) => {
  if (index >= 0 && index < itemImages.value.length) {
    currentImageIndex.value = index;
  }
};

// Auto-slide functionality
const startAutoSlide = () => {
  if (hasMultipleImages.value) {
    autoSlideInterval = setInterval(() => {
      nextImage();
    }, 3000); // Change image every 3 seconds
  }
};

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
};

// Lifecycle hooks
onMounted(async () => {
  startAutoSlide();
  // Check favorite status when component mounts
  await checkFavoriteStatus();
});

onUnmounted(() => {
  stopAutoSlide();
});

// Helper function to get primary image
const getPrimaryImage = (item: any) => {
  // Check if images are at root level first
  if (item.images && item.images.length > 0) {
    const primaryImage = item.images.find((img: any) => img.isPrimary);
    return primaryImage ? primaryImage.url : item.images[0].url;
  }
  // Fallback to nested structure
  if (item.item?.images && item.item.images.length > 0) {
    const primaryImage = item.item.images.find((img: any) => img.isPrimary);
    return primaryImage ? primaryImage.url : item.item.images[0].url;
  }
  return 'https://picsum.photos/400/300?random=16';
};

// Helper function to get average rating
const getAverageRating = (item: any) => {
  // Check if the API provides computed averageRating
  if (item.averageRating !== undefined) {
    return item.averageRating;
  }
  // Check if reviews are at root level first
  if (item.reviews && item.reviews.length > 0) {
    const totalRating = item.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    return Math.round(totalRating / item.reviews.length);
  }
  // Fallback to nested structure
  if (item.item?.reviews && item.item.reviews.length > 0) {
    const totalRating = item.item.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    return Math.round(totalRating / item.item.reviews.length);
  }
  return 0;
};

// Helper function to get review count
const getReviewCount = (item: any) => {
  // Check if the API provides computed totalReviews
  if (item.totalReviews !== undefined) {
    return item.totalReviews;
  }
  // Check if reviews are at root level first
  if (item.reviews) {
    return item.reviews.length;
  }
  // Fallback to nested structure
  return item.item?.reviews?.length || 0;
};

// Helper function to get current price
const getCurrentPrice = (item: any) => {
  // Check if the API provides computed currentPrice
  if (item.currentPrice) {
    return item.currentPrice;
  }
  // Fallback to prices array
  if (item.prices && item.prices.length > 0) {
    const activePrice = item.prices.find((price: any) => price.isActive);
    return activePrice ? activePrice.price : item.prices[0].price;
  }
  return 0;
};

// Helper function to get original price
const getOriginalPrice = (item: any) => {
  // Check if the API provides computed salePrice
  if (item.salePrice) {
    return item.salePrice;
  }
  // Fallback to prices array
  if (item.prices && item.prices.length > 0) {
    const activePrice = item.prices.find((price: any) => price.isActive);
    return activePrice ? activePrice.price : item.prices[0].price;
  }
  return 0;
};
</script>

<style scoped>
.item-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 0px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.item-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.item-image {
  position: relative;
  height: 200px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover !important;
}

/* Slideshow Styles */
.image-slideshow {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slideshow-image {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: cover !important;
  transition: opacity 0.3s ease;
}

.single-image {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: cover !important;
}

.image-indicators {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 2;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 0px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

.indicator-dot.active {
  background: #DB4444;
  border-color: #DB4444;
}

.sale-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #DB4444;
  color: white;
  padding: 4px 8px;
  border-radius: 0px;
  font-size: 12px;
  font-weight: 600;
}

.item-info {
  padding: 20px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.item-rating {
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

.item-price {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #DB4444;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.item-actions {
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

.favorite-btn {
  transition: all 0.2s ease;
}

.favorite-btn.favorited {
  color: #DB4444 !important;
}

.favorite-btn.favorited:hover {
  color: #B91C1C !important;
}

.add-to-cart-btn {
  font-size: 12px;
  padding: 8px 16px;
  height: 32px;
  text-transform: none;
  border-radius: 6px !important;
}

/* Responsive Design */
@media (max-width: 600px) {
  .item-image {
    height: 160px;
  }
  
  .item-info {
    padding: 16px;
  }
  
  .item-name {
    font-size: 14px;
  }
  
  .current-price {
    font-size: 16px;
  }
}
</style>
