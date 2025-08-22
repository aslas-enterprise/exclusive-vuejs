import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import Stripe from 'stripe';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
    CreateOrderDto,
    OrderDto,
    OrderResponseDto,
    OrderStatus,
    PaymentStatus
} from './dto/order.dto';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private emailService: EmailService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-07-30.basil',
    });
  }

  async createOrder(createOrderDto: CreateOrderDto, userId?: string): Promise<OrderResponseDto> {
    // Get cart and validate
    const cart = await this.cartService.getCartById(createOrderDto.cartId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate costs
    const subtotal = parseFloat(cart.subtotal.toString());
    const shippingCost = this.calculateShippingCost(subtotal);
    const tax = this.calculateTax(subtotal + shippingCost);
    const total = subtotal + shippingCost + tax;

    // Determine if this is a guest order
    const isGuestOrder = !userId || createOrderDto.isGuestOrder || false;

    // Create Stripe payment intent first (before creating order)
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        cartId: createOrderDto.cartId,
        isGuestOrder: isGuestOrder.toString(),
        userId: userId || 'guest',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Add customer information if available
      receipt_email: createOrderDto.guestUserInfo?.email || undefined,
      shipping: createOrderDto.guestUserInfo ? {
        name: createOrderDto.guestUserInfo.name,
        address: {
          line1: createOrderDto.shippingAddress.address,
          city: createOrderDto.shippingAddress.city,
          state: createOrderDto.shippingAddress.state,
          country: createOrderDto.shippingAddress.country,
          postal_code: createOrderDto.shippingAddress.postalCode || '',
        },
      } : undefined,
    });

    // Return payment intent details for frontend to handle payment
    return {
      order: undefined,
      message: 'Payment intent created. Complete payment to create order.',
      clientSecret: paymentIntent.client_secret || undefined,
      paymentIntentId: paymentIntent.id,
      orderDetails: {
        cartId: createOrderDto.cartId,
        subtotal,
        shippingCost,
        tax,
        total,
        isGuestOrder,
        guestUserInfo: createOrderDto.guestUserInfo,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress || createOrderDto.shippingAddress,
        notes: createOrderDto.notes,
        userId,
      },
    };
  }

  async createPaymentIntent(createOrderDto: CreateOrderDto, userId?: string): Promise<OrderResponseDto> {
    // Get cart and validate
    const cart = await this.cartService.getCartById(createOrderDto.cartId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate costs
    const subtotal = parseFloat(cart.subtotal.toString());
    const shippingCost = this.calculateShippingCost(subtotal);
    const tax = this.calculateTax(subtotal + shippingCost);
    const total = subtotal + shippingCost + tax;

    // Determine if this is a guest order
    const isGuestOrder = !userId || createOrderDto.isGuestOrder || false;

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        cartId: createOrderDto.cartId,
        isGuestOrder: isGuestOrder.toString(),
        userId: userId || 'guest',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Add customer information if available
      receipt_email: createOrderDto.guestUserInfo?.email || undefined,
      shipping: createOrderDto.guestUserInfo ? {
        name: createOrderDto.guestUserInfo.name,
        address: {
          line1: createOrderDto.shippingAddress.address,
          city: createOrderDto.shippingAddress.city,
          state: createOrderDto.shippingAddress.state,
          country: createOrderDto.shippingAddress.country,
          postal_code: createOrderDto.shippingAddress.postalCode || '',
        },
      } : undefined,
    });

    // Return payment intent details for frontend to handle payment
    return {
      order: undefined,
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret || undefined,
      paymentIntentId: paymentIntent.id,
      orderDetails: {
        cartId: createOrderDto.cartId,
        subtotal,
        shippingCost,
        tax,
        total,
        isGuestOrder,
        guestUserInfo: createOrderDto.guestUserInfo,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress || createOrderDto.shippingAddress,
        notes: createOrderDto.notes,
        userId,
      },
    };
  }

  async confirmOrderAfterPayment(
    paymentIntentId: string, 
    orderDetails: any
  ): Promise<OrderDto> {
    // Verify payment with Stripe and get expanded data
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges.data.payment_method_details.card'],
    }) as any; // Type assertion to handle expanded data
    
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not completed');
    }

    // Get cart and validate
    const cart = await this.cartService.getCartById(orderDetails.cartId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate costs
    const subtotal = parseFloat(cart.subtotal.toString());
    const shippingCost = this.calculateShippingCost(subtotal);
    const tax = this.calculateTax(subtotal + shippingCost);
    const total = subtotal + shippingCost + tax;

    // Create the order
    const order = await this.prisma.order.create({
      data: {
        userId: orderDetails.userId || null,
        guestUserInfo: orderDetails.guestUserInfo ? JSON.stringify(orderDetails.guestUserInfo) : null,
        shippingAddress: JSON.stringify(orderDetails.shippingAddress),
        billingAddress: JSON.stringify(orderDetails.billingAddress || orderDetails.shippingAddress),
        subtotal,
        shippingCost,
        tax,
        total,
        status: 'confirmed',
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentIntentId,
        notes: orderDetails.notes,
        isGuestOrder: orderDetails.isGuestOrder,
      },
    });

    // Create order items
    const orderItems = cart.items.map(item => ({
      orderId: order.id,
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price,
    }));

    await this.prisma.orderItem.createMany({
      data: orderItems,
    });

    // Extract payment details from Stripe response
    const charge = paymentIntent.charges?.data?.[0];
    const cardDetails = charge?.payment_method_details?.card;

    // Create payment history record
    await this.prisma.paymentHistory.create({
      data: {
        orderId: order.id,
        userId: orderDetails.userId || null,
        stripePaymentIntentId: paymentIntentId,
        amount: total,
        currency: 'USD',
        status: 'succeeded',
        paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
        last4: cardDetails?.last4 || null,
        brand: cardDetails?.brand || null,
        receiptUrl: charge?.receipt_url || null,
      },
    });

    // Clear the cart after successful order
    await this.cartService.clearCart(orderDetails.cartId);

    // Send order confirmation email
    try {
      let userEmail = orderDetails.guestUserInfo?.email || '';
      let userName = orderDetails.guestUserInfo?.name || 'Customer';

      // If it's a logged-in user, get their information from the database
      if (orderDetails.userId && !orderDetails.isGuestOrder) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: orderDetails.userId },
            select: { email: true, name: true }
          });
          if (user) {
            userEmail = user.email;
            userName = user.name;
          }
        } catch (userError) {
          console.error('Failed to fetch user information:', userError);
        }
      }

      if (userEmail) {
        const emailData = {
          name: userName,
          email: userEmail,
          orderId: order.id,
          orderDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          total: total,
          items: cart.items.map(item => ({
            name: item.item.name,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: `${orderDetails.shippingAddress.address}, ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}, ${orderDetails.shippingAddress.country}`
        };

        await this.emailService.sendOrderConfirmationEmail(emailData);
      }
    } catch (error) {
      // Log error but don't fail the order creation
      console.error('Failed to send order confirmation email:', error);
    }

    // Return the created order
    return this.mapOrderToDto(order);
  }

  async getOrderById(orderId: string, userId?: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check access control
    if (order.userId && order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.mapOrderToDto(order);
  }

  async getPaymentHistory(orderId: string, userId?: string): Promise<any[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { paymentHistory: true }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user has access to this order
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('Access denied to this order');
    }

    return order.paymentHistory || [];
  }

  async getOrderStatus(orderId: string): Promise<{ status: OrderStatus }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return { status: order.status as OrderStatus };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true }
    });

    return this.mapOrderToDto(updatedOrder);
  }

  async cancelOrder(orderId: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: { items: true }
    });

    return this.mapOrderToDto(updatedOrder);
  }

  async getOrderHistory(): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(order => this.mapOrderToDto(order));
  }

  async getGuestOrder(orderId: string, email: string): Promise<OrderDto> {
    const order = await this.prisma.order.findFirst({
      where: { 
        id: orderId,
        guestUserInfo: {
          contains: email
        }
      },
      include: { items: true }
    });

    if (!order) {
      throw new NotFoundException('Guest order not found');
    }

    return this.mapOrderToDto(order);
  }

  async getUserOrders(userId: string): Promise<OrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            item: {
              include: {
                images: true,
                category: true,
                subcategory: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => this.mapOrderToDto(order));
  }

  async confirmPayment(orderId: string, paymentIntentId: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.stripePaymentIntentId !== paymentIntentId) {
      throw new BadRequestException('Invalid payment intent');
    }

    // Verify payment with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.COMPLETED,
        },
        include: {
          items: {
            include: {
              item: {
                include: {
                  images: true,
                  category: true,
                  subcategory: true,
                },
              },
            },
          },
        },
      });

      return this.mapOrderToDto(updatedOrder);
    } else {
      throw new BadRequestException('Payment not completed');
    }
  }

  private calculateShippingCost(subtotal: number): number {
    // Free shipping for orders over $50
    if (subtotal >= 50) {
      return 0;
    }
    // Flat rate shipping
    return 5.99;
  }

  private calculateTax(subtotal: number): number {
    // Simple tax calculation (8.5%)
    return Math.round((subtotal * 0.085) * 100) / 100;
  }

  private mapOrderToDto(order: any): OrderDto {
    return {
      id: order.id,
      userId: order.userId || undefined,
      guestUserInfo: order.guestUserInfo ? JSON.parse(order.guestUserInfo) : undefined,
      shippingAddress: JSON.parse(order.shippingAddress),
      billingAddress: JSON.parse(order.billingAddress),
      items: order.items.map((item: any) => ({
        id: item.id,
        itemId: item.itemId,
        item: item.item,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      stripePaymentIntentId: order.stripePaymentIntentId,
      notes: order.notes,
      isGuestOrder: order.isGuestOrder,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
