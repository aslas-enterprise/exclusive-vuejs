<template>
  <div class="order-success-page">
    <div class="container mx-auto px-4 py-16 text-center">
      <div class="max-w-2xl mx-auto">
        <!-- Success Icon -->
        <div class="mb-8">
          <div class="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <!-- Success Message -->
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p class="text-xl text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed and confirmed.
        </p>

        <!-- Order Details -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8 text-left">
          <h2 class="text-xl font-semibold mb-4">Order Details</h2>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Order ID:</span>
              <span class="font-medium">{{ orderId }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span class="font-medium text-green-600">Confirmed</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Payment:</span>
              <span class="font-medium text-green-600">Completed</span>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul class="text-blue-800 space-y-2 text-left">
            <li class="flex items-center">
              <span class="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              You'll receive an order confirmation email shortly
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              We'll process your order and prepare it for shipping
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              You'll receive tracking information once your order ships
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue Shopping
          </router-link>
          
          <router-link
            :to="{ name: 'profile' }"
            v-if="authStore.isAuthenticated"
            class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Orders
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores'

const route = useRoute()
const authStore = useAuthStore()

const orderId = computed(() => route.params.orderId as string)
</script>

<style scoped>
.order-success-page {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>
