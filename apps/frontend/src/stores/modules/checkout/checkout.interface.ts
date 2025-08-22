export interface GuestUserInfo {
  name: string
  email: string
  phone: string
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode?: string
}

export interface CreateOrderRequest {
  cartId: string
  guestUserInfo?: GuestUserInfo
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  notes?: string
  isGuestOrder?: boolean
}

export interface OrderResponse {
  order?: any
  message: string
  clientSecret?: string
  paymentIntentId?: string
  orderDetails?: {
    cartId: string
    subtotal: number
    shippingCost: number
    tax: number
    total: number
    isGuestOrder: boolean
    guestUserInfo?: GuestUserInfo
    shippingAddress: ShippingAddress
    billingAddress: ShippingAddress
    notes?: string
    userId?: string
  }
}

export interface ConfirmOrderRequest {
  paymentIntentId: string
  orderDetails: any
}

export interface CheckoutState {
  isLoading: boolean
  error: string | null
  currentOrder: any | null
  paymentIntent: any | null
  stripe: any | null
  elements: any | null
  cardElement: any | null
  isStripeInitialized: boolean
  countries: any[]
  states: any[]
  cities: any[]
}
