<template>
  <div class="actions-section">
    <!-- Quantity Selector -->
    <div class="quantity-section">
      <label class="quantity-label">Quantity:</label>
      <div class="quantity-controls">
        <v-btn 
          icon="mdi-minus" 
          variant="outlined" 
          size="small"
          @click="decreaseQuantity"
          :disabled="quantity <= 1"
        />
        <span class="quantity-display">{{ quantity }}</span>
        <v-btn 
          icon="mdi-plus" 
          variant="outlined" 
          size="small"
          @click="increaseQuantity"
          :disabled="quantity >= maxQuantity"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="buttons-section">
      <v-btn 
        color="primary" 
        variant="flat" 
        size="large"
        class="add-to-cart-btn"
        :disabled="!isInStock || addToCartLoading"
        :loading="addToCartLoading"
        @click="handleAddToCart"
      >
        <v-icon icon="mdi-cart-plus" class="me-2" />
        Add to Cart
      </v-btn>

      <v-btn 
        :icon="isFavorited ? 'mdi-heart' : 'mdi-heart-outline'" 
        variant="outlined" 
        size="large"
        class="favorite-btn"
        :class="{ 'favorited': isFavorited }"
        @click="handleFavoriteClick"
        :loading="favoriteLoading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ItemModalActionsProps {
  item: any;
  quantity: number;
  isInStock: boolean;
  isFavorited: boolean;
  addToCartLoading: boolean;
  favoriteLoading: boolean;
}

const props = defineProps<ItemModalActionsProps>();
const emit = defineEmits<{
  'update:quantity': [quantity: number];
  'add-to-cart': [item: any, quantity: number];
  'favorite-click': [];
}>();

// Computed properties
const maxQuantity = computed(() => {
  const stock = props.item.stock || props.item.item?.stock;
  const availableStock = stock ? stock.quantity : 0;
  return Math.min(availableStock, 10); // Max 10 items per order
});

// Methods
const increaseQuantity = () => {
  if (props.quantity < maxQuantity.value) {
    emit('update:quantity', props.quantity + 1);
  }
};

const decreaseQuantity = () => {
  if (props.quantity > 1) {
    emit('update:quantity', props.quantity - 1);
  }
};

const handleAddToCart = () => {
  emit('add-to-cart', props.item, props.quantity);
};

const handleFavoriteClick = () => {
  emit('favorite-click');
};
</script>

<style scoped>
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.quantity-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quantity-label {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-display {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  min-width: 40px;
  text-align: center;
}

.buttons-section {
  display: flex;
  gap: 16px;
}

.add-to-cart-btn {
  flex: 1;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px !important;
}

.favorite-btn {
  width: 48px;
  height: 48px;
  border-radius: 6px !important;
}

.favorite-btn.favorited {
  color: #DB4444 !important;
  border-color: #DB4444 !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .buttons-section {
    flex-direction: column;
  }
  
  .add-to-cart-btn {
    width: 100%;
  }
}
</style>
