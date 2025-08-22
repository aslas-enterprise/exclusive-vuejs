export namespace ICheckout {
  export interface CreateOrderRequest {
    cartId: string
    userId?: string
    guestUserInfo?: {
      name: string
      email: string
      phone: string
    }
    shippingAddress: {
      address: string
      city: string
      state: string
      country: string
      postalCode: string
    }
    billingAddress?: {
      address: string
      city: string
      state: string
      country: string
      postalCode: string
    }
    notes?: string
    isGuestOrder: boolean
  }

  export interface ConfirmOrderRequest {
    paymentIntentId: string
    orderDetails: {
      cartId: string
      subtotal: number
      shippingCost: number
      tax: number
      total: number
      isGuestOrder: boolean
      guestUserInfo?: {
        name: string
        email: string
        phone: string
      }
      shippingAddress: {
        address: string
        city: string
        state: string
        country: string
        postalCode: string
      }
      billingAddress?: {
        address: string
        city: string
        state: string
        country: string
        postalCode: string
      }
      notes?: string
      userId?: string
    }
  }

  export interface PaymentIntentResponse {
    id: string
    clientSecret: string
    amount: number
    currency: string
    status: string
  }

  export interface OrderResponse {
    id: string
    userId?: string
    guestUserInfo?: string
    shippingAddress: string
    billingAddress: string
    subtotal: number
    shippingCost: number
    tax: number
    total: number
    status: string
    paymentStatus: string
    stripePaymentIntentId: string
    notes?: string
    isGuestOrder: boolean
    createdAt: string
    updatedAt: string
    items: OrderItem[]
  }

  export interface OrderItem {
    id: string
    orderId: string
    itemId: string
    quantity: number
    price: number
    item: {
      id: string
      name: string
      description: string
      price: number
      images: string[]
    }
  }

  export interface PaymentHistory {
    id: string
    orderId: string
    userId?: string
    stripePaymentIntentId: string
    amount: number
    currency: string
    status: string
    paymentMethod?: string
    last4?: string
    brand?: string
    receiptUrl?: string
    failureReason?: string
    createdAt: string
    updatedAt: string
  }
}
