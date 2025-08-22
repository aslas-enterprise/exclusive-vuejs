import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CheckoutApis } from '../../apis/checkout.api'
import { ICheckout } from './checkout.types'
import { useCartStore } from '../cart/cart.store'
import { useAuthStore } from '../auth/auth.store'

export const useCheckoutStore = defineStore('checkout', () => {
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentOrder = ref<ICheckout.OrderResponse | null>(null)
  const paymentIntent = ref<ICheckout.PaymentIntentResponse | null>(null)

  // Getters
  const isLoggedIn = computed(() => authStore.isAuthenticated)
  const userInfo = computed(() => authStore.user)

  // Actions
  const createPaymentIntent = async (orderData: ICheckout.CreateOrderRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await CheckoutApis.createPaymentIntent(orderData)
      paymentIntent.value = response
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create payment intent'
      throw err
    } finally {
      loading.value = false
    }
  }

  const confirmOrderAfterPayment = async (paymentData: ICheckout.ConfirmOrderRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await CheckoutApis.confirmOrderAfterPayment(paymentData)
      currentOrder.value = response
      
      // Clear cart after successful order
      if (response.id) {
        await cartStore.clearCart()
      }
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to confirm order'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getOrderById = async (orderId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await CheckoutApis.getOrderById(orderId)
      currentOrder.value = response
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to get order'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPaymentHistory = async (orderId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await CheckoutApis.getPaymentHistory(orderId)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to get payment history'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetOrder = () => {
    currentOrder.value = null
    paymentIntent.value = null
    error.value = null
  }

  return {
    // State
    loading,
    error,
    currentOrder,
    paymentIntent,
    
    // Getters
    isLoggedIn,
    userInfo,
    
    // Actions
    createPaymentIntent,
    confirmOrderAfterPayment,
    getOrderById,
    getPaymentHistory,
    clearError,
    resetOrder,
  }
})

