import axiosInstance from './axios-instance'
import { OrdersUrls } from '../urls/orders'
import { ICheckout } from '../modules/checkout/checkout.types'

export const CheckoutApis = {
  // Create payment intent
  async createPaymentIntent(orderData: ICheckout.CreateOrderRequest): Promise<ICheckout.PaymentIntentResponse> {
    const response = await axiosInstance.post(OrdersUrls.CREATE_PAYMENT_INTENT, orderData)
    return response.data
  },

  // Confirm order after payment
  async confirmOrderAfterPayment(paymentData: ICheckout.ConfirmOrderRequest): Promise<ICheckout.OrderResponse> {
    const response = await axiosInstance.post(OrdersUrls.CONFIRM_ORDER_AFTER_PAYMENT, paymentData)
    return response.data
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<ICheckout.OrderResponse> {
    const response = await axiosInstance.get(OrdersUrls.GET_ORDER_BY_ID(orderId))
    return response.data
  },

  // Get payment history for an order
  async getPaymentHistory(orderId: string): Promise<ICheckout.PaymentHistory[]> {
    const response = await axiosInstance.get(OrdersUrls.GET_PAYMENT_HISTORY(orderId))
    return response.data
  },

  // Get user orders
  async getUserOrders(): Promise<ICheckout.OrderResponse[]> {
    const response = await axiosInstance.get(OrdersUrls.GET_USER_ORDERS)
    return response.data
  }
}
