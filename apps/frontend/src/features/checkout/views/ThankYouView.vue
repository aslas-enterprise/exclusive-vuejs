<template>
  <div class="thank-you-container">
    <div class="thank-you-content">
      <div class="success-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 class="thank-you-title">Thank You!</h1>
      <p class="thank-you-message">Your order has been placed successfully.</p>
      
      <div v-if="orderId" class="order-details">
        <OrderInfo 
          :order-id="orderId"
          :order-date="currentDate"
        />
        
        <OrderSummary 
          :order="order || undefined"
        />
        
        <ShippingInfo 
          :address="shippingAddress"
        />
        
        <p class="order-note">
          You will receive a confirmation email shortly with your order details and tracking information.
        </p>
      </div>
      
      <div class="action-buttons">
        <router-link to="/" class="btn btn-primary">
          Continue Shopping
        </router-link>
        <router-link v-if="orderId" :to="`/orders/${orderId}`" class="btn btn-secondary">
          View Order Details
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCheckoutStore } from '../../../stores/modules/checkout'
import { useCartStore } from '../../../stores/modules/cart'
import OrderInfo from '../components/OrderInfo.vue'
import OrderSummary from '../components/OrderSummary.vue'
import ShippingInfo from '../components/ShippingInfo.vue'

const route = useRoute()
const router = useRouter()
const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()

const orderId = computed(() => route.query.orderId as string)
const currentDate = computed(() => new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}))

const order = computed(() => checkoutStore.currentOrder?.value)
const shippingAddress = computed(() => {
  if (order.value?.shippingAddress) {
    try {
      return JSON.parse(order.value.shippingAddress)
    } catch {
      return null
    }
  }
  return null
})

onMounted(async () => {
  // If no order ID, redirect to home
  if (!orderId.value) {
    router.push('/')
    return
  }
  
  // Clear cart from local storage
  await cartStore.clearCart()
})
</script>

<style scoped>
.thank-you-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.thank-you-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  color: #10b981;
}

.success-icon svg {
  width: 100%;
  height: 100%;
}

.thank-you-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.thank-you-message {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.order-details {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.order-note {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(220, 38, 38, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .thank-you-content {
    padding: 2rem;
  }
  
  .thank-you-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
