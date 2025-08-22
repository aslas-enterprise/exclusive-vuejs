import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderDto, OrderResponseDto, ConfirmOrderAfterPaymentDto, OrderStatus } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment intent for order (payment first)' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any,
  ): Promise<OrderResponseDto> {
    // Extract user ID if authenticated
    const userId = req.user?.id;
    return this.ordersService.createOrder(createOrderDto, userId);
  }

  @Post('create-payment-intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Stripe payment intent for order' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async createPaymentIntent(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any,
  ): Promise<OrderResponseDto> {
    // Extract user ID if authenticated
    const userId = req.user?.id;
    return this.ordersService.createPaymentIntent(createOrderDto, userId);
  }

  @Post('confirm-after-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm order after successful payment' })
  @ApiResponse({ status: 200, description: 'Order confirmed and created successfully', type: OrderDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async confirmOrderAfterPayment(
    @Body() confirmOrderDto: ConfirmOrderAfterPaymentDto,
  ): Promise<OrderDto> {
    return this.ordersService.confirmOrderAfterPayment(
      confirmOrderDto.paymentIntentId,
      confirmOrderDto.orderDetails
    );
  }

  @Get(':id')
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ): Promise<OrderDto> {
    return this.ordersService.getOrderById(id, user?.id);
  }

  @Get(':id/payment-history')
  async getPaymentHistory(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ): Promise<any[]> {
    return this.ordersService.getPaymentHistory(id, user?.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders (authenticated users only)' })
  @ApiResponse({ status: 200, description: 'User orders retrieved successfully', type: [OrderDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserOrders(@CurrentUser() user: any): Promise<OrderDto[]> {
    return this.ordersService.getUserOrders(user.id);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders (authenticated users only)' })
  @ApiResponse({ status: 200, description: 'User orders retrieved successfully', type: [OrderDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserOrdersAlternative(@CurrentUser() user: any): Promise<OrderDto[]> {
    return this.ordersService.getUserOrders(user.id);
  }

  @Get(':id/status')
  async getOrderStatus(@Param('id') id: string): Promise<{ status: OrderStatus }> {
    return this.ordersService.getOrderStatus(id);
  }

  @Post(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus }
  ): Promise<OrderDto> {
    return this.ordersService.updateOrderStatus(id, body.status);
  }

  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string): Promise<OrderDto> {
    return this.ordersService.cancelOrder(id);
  }

  @Get('history')
  async getOrderHistory(): Promise<OrderDto[]> {
    return this.ordersService.getOrderHistory();
  }

  @Post('guest')
  async createGuestOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(createOrderDto, undefined);
  }

  @Get('guest/:id')
  async getGuestOrder(
    @Param('id') id: string,
    @Body() body: { email: string }
  ): Promise<OrderDto> {
    return this.ordersService.getGuestOrder(id, body.email);
  }
}
