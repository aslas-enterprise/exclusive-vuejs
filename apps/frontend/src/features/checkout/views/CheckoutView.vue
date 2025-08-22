<template>
  <div class="checkout-container">
    <div class="checkout-content">
      <div class="checkout-form-section">
        <h1 class="checkout-title">Checkout</h1>
        
        <!-- Empty Cart Message -->
        <div v-if="isCartEmpty" class="empty-cart-message">
          <div class="empty-cart-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 class="empty-cart-title">Your cart is empty</h2>
          <p class="empty-cart-description">Add some products to your cart to continue with checkout.</p>
          <router-link to="/products" class="btn-go-to-products">
            Browse Products
          </router-link>
        </div>
        
        <v-form v-else ref="checkoutForm" class="checkout-form" @submit.prevent="handleSubmit">
          <!-- Contact Information -->
          <ContactInformation 
            ref="contactForm"
            :is-logged-in="isLoggedIn"
            :user-info="userInfo"
            @update="handleContactInfoUpdate"
          />

          <!-- Shipping Address -->
          <ShippingAddress 
            ref="shippingForm"
            title="Shipping Address"
            :model-value="formData.shippingAddress"
            @update:model-value="handleShippingUpdate"
          />

          <!-- Billing Address -->
          <ShippingAddress 
            ref="billingForm"
            title="Billing Address"
            :use-same-address="true"
            :model-value="formData.billingAddress || formData.shippingAddress"
            @update:model-value="handleBillingUpdate"
          />

          <!-- Payment Method -->
          <PaymentMethod 
            ref="paymentForm"
            :stripe="stripe"
            :elements="elements"
            @card-element-ready="cardElement = $event"
            @update="handlePaymentUpdate"
          />

          <!-- Order Notes -->
          <OrderNotes 
            ref="notesForm"
            :model-value="{ notes: formData.notes || '' }"
            @update:model-value="handleNotesUpdate"
          />

          <!-- Submit Button -->
          <SubmitButton 
            :is-processing="checkoutStore.loading.value"
            :total="Number(total)"
            @submit="handleSubmit"
          />
        </v-form>
      </div>

      <!-- Order Summary -->
      <div v-if="!isCartEmpty" class="order-summary-section">
        <CartSummary />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckoutStore } from '../../../stores/modules/checkout/checkout.store'
import { useCartStore } from '../../../stores/modules/cart/cart.store'
import { useAuthStore } from '../../../stores/modules/auth/auth.store'
import { ICheckout } from '../../../stores/modules/checkout/checkout.types'
import { loadStripe } from '@stripe/stripe-js'
import ContactInformation from '../components/ContactInformation.vue'
import ShippingAddress from '../components/ShippingAddress.vue'
import PaymentMethod from '../components/PaymentMethod.vue'
import OrderNotes from '../components/OrderNotes.vue'
import CartSummary from '../components/CartSummary.vue'
import SubmitButton from '../components/SubmitButton.vue'
import { User } from '../../../stores/modules/auth/auth.interface'

const router = useRouter()
const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

// Form refs
const checkoutForm = ref()
const contactForm = ref()
const shippingForm = ref()
const paymentForm = ref()
const notesForm = ref()

// Stripe
const stripe = ref<any>(null)
const elements = ref<any>(null)
const cardElement = ref<any>(null)

// Form data
const formData = ref<ICheckout.CreateOrderRequest>({
  cartId: '',
  userId: undefined,
  guestUserInfo: {
    name: '',
    email: '',
    phone: ''
  },
  shippingAddress: {
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  },
  billingAddress: {
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  },
  notes: '',
  isGuestOrder: true
})

// Computed
const isLoggedIn = computed(() => authStore.isAuthenticated)
const userInfo = computed(() => authStore.user as unknown as User)
const total = computed(() => {
  const cart = cartStore.cart as any
  return cart ? Number(cart.total || 0).toFixed(2) : '0.00'
})
const isCartEmpty = computed(() => {
  const cart = cartStore.cart
  return !cart || (cart as any)?.items?.length === 0
})

// Methods
const initializeStripe = async () => {
  try {
    const stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    if (stripeInstance) {
      stripe.value = stripeInstance
      elements.value = stripeInstance.elements()
    }
  } catch (error) {
    console.error('Failed to initialize Stripe:', error)
  }
}

const handleContactInfoUpdate = (data: any) => {
  if (isLoggedIn.value && userInfo.value) {
    formData.value.userId = userInfo.value.id
    formData.value.isGuestOrder = false
  } else {
    // Ensure phone number includes country code if available
    if (data.phone && !data.phone.startsWith('+')) {
      // If phone doesn't have country code, we'll need to get it from the component
      // For now, we'll store it as is and let the backend handle validation
      formData.value.guestUserInfo = data
    } else {
      formData.value.guestUserInfo = data
    }
    formData.value.isGuestOrder = true
  }
}

const handleShippingUpdate = (data: any) => {
  formData.value.shippingAddress = data
  // Use same address for billing if not specified
  if (!formData.value.billingAddress?.address) {
    formData.value.billingAddress = { ...data }
  }
}

const handleBillingUpdate = (data: any) => {
  if (formData.value.billingAddress) {
    formData.value.billingAddress = data
  }
}

const handlePaymentUpdate = (data: any) => {
  // Payment method selection is handled in the component
}

const handleNotesUpdate = (data: any) => {
  formData.value.notes = data.notes
}

const handleSubmit = async () => {
  try {
    // Validate all forms
    const contactValid = await contactForm.value?.validate()
    const shippingValid = await shippingForm.value?.validate()
    const paymentValid = await paymentForm.value?.validate()
    const notesValid = await notesForm.value?.validate()

    if (!contactValid || !shippingValid || !paymentValid || !notesValid) {
      return
    }

    // Set cart ID
    const cartId = cartStore.cartId
    if (!cartId) {
      throw new Error('No cart ID available')
    }
    formData.value.cartId = cartId

    // Create payment intent
    const paymentIntent = await checkoutStore.createPaymentIntent(formData.value)
console.log('paymentIntent', paymentIntent);

    // Process payment with Stripe
    if (stripe.value && cardElement.value) {
      const { error, paymentIntent: confirmedIntent } = await stripe.value.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement.value,
            billing_details: {
              name: isLoggedIn.value ? userInfo.value?.name : formData.value.guestUserInfo?.name,
              email: isLoggedIn.value ? userInfo.value?.email : formData.value.guestUserInfo?.email,
              phone: isLoggedIn.value ? '' : formData.value.guestUserInfo?.phone,
            },
          },
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      // Confirm order after successful payment
      const cart = cartStore.cart as any
      const subtotal = Number(cart?.subtotal || 0)
      const shippingCost = subtotal >= 50 ? 0 : 5.99
      const tax = Math.round((subtotal + shippingCost) * 0.085 * 100) / 100
      const total = Number(cart?.total || 0)
      
   
      
      const orderResponse = await checkoutStore.confirmOrderAfterPayment({
        paymentIntentId: confirmedIntent.id,
        orderDetails: {
          cartId: formData.value.cartId,
          subtotal,
          shippingCost,
          tax,
          total,
          isGuestOrder: formData.value.isGuestOrder,
          guestUserInfo: formData.value.guestUserInfo,
          shippingAddress: formData.value.shippingAddress,
          billingAddress: formData.value.billingAddress,
          notes: formData.value.notes,
          userId: formData.value.userId
        }
      })
      
      console.log('Order confirmation response:', orderResponse)
      console.log('Current order in store:', checkoutStore.currentOrder?.value)

      // Redirect to thank you page
      const orderId = checkoutStore.currentOrder?.value?.id || orderResponse?.id
      console.log('Final orderId for redirect:', orderId)
      if (orderId) {
        router.push(`/checkout/thank-you?orderId=${orderId}`)
      } else {
        console.error('No order ID available for redirect')
        // Fallback: redirect to orders page or show error
        router.push('/orders')
      }
    }
  } catch (error: any) {
    console.error('Checkout error:', error)
    // Error is handled by the store
  }
}
const cartId = computed(() => cartStore.cartId as unknown as string)

const fetchCart = async () => {

  if (cartId) {
    await cartStore.fetchCartById(cartId.value)
  }
}

// Lifecycle
onMounted(async () => {
  await initializeStripe()
  await fetchCart()
  
  // Pre-fill form if user is logged in
  if (isLoggedIn.value && userInfo.value) {
    formData.value.userId = userInfo.value.id
    formData.value.isGuestOrder = false
    formData.value.guestUserInfo = {
      name: userInfo.value.name || '',
      email: userInfo.value.email || '',
      phone: ''
    }
  }
})
</script>

<style scoped>
.checkout-container {
  min-height: 100vh;

  padding: 2rem 0;
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}
.checkout-form{
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkout-form-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.checkout-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-cart-message {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
}

.empty-cart-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  color: #94a3b8;
}

.empty-cart-icon svg {
  width: 100%;
  height: 100%;
}

.empty-cart-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 1rem;
}

.empty-cart-description {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-go-to-products {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.btn-go-to-products:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.order-summary-section {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .order-summary-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 1rem 0;
  }
  
  .checkout-content {
    padding: 0 0.5rem;
    gap: 1rem;
  }
  
  .checkout-form-section {
    padding: 1.5rem;
  }
  
  .checkout-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
  
  .empty-cart-message {
    padding: 2rem 1rem;
  }
  
  .empty-cart-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
  }
  
  .empty-cart-title {
    font-size: 1.5rem;
  }
  
  .empty-cart-description {
    font-size: 1rem;
  }
  
  .btn-go-to-products {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}
</style>


