import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class AddressInfo {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  address!: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city!: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  state!: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country!: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @IsString()
  postalCode!: string;
}

export class ContactInfo {
  @ApiProperty({ description: 'Full name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone!: string;
}

export class GuestUserInfo {
  @ApiProperty({ description: 'Guest user full name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Guest user email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Guest user phone number' })
  @IsString()
  phone!: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country!: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  state!: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city!: string;

  @ApiProperty({ description: 'Detailed address' })
  @IsString()
  address!: string;

  @ApiProperty({ description: 'Postal/ZIP code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class OrderItemDto {
  @ApiProperty({ description: 'Item ID' })
  @IsString()
  itemId!: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ description: 'Price per item' })
  @IsNumber()
  price!: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Cart ID' })
  @IsString()
  cartId!: string;

  @ApiProperty({ description: 'Guest user information (if not logged in)', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfo)
  guestUserInfo?: ContactInfo;

  @ApiProperty({ description: 'Shipping address', type: AddressInfo })
  @ValidateNested()
  @Type(() => AddressInfo)
  shippingAddress!: AddressInfo;

  @ApiProperty({ description: 'Billing address (same as shipping if not provided)', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInfo)
  billingAddress?: AddressInfo;

  @ApiProperty({ description: 'Order notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Payment method', default: 'card' })
  @IsString()
  paymentMethod: string = 'card';

  @ApiProperty({ description: 'Whether this is a guest order', default: false })
  @IsOptional()
  isGuestOrder?: boolean = false;
}

export class OrderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId?: string;

  @ApiProperty()
  guestUserInfo?: ContactInfo;

  @ApiProperty()
  shippingAddress!: AddressInfo;

  @ApiProperty()
  billingAddress!: AddressInfo;

  @ApiProperty({ type: [OrderItemDto] })
  items!: OrderItemDto[];

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  shippingCost!: number;

  @ApiProperty()
  tax!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus!: PaymentStatus;

  @ApiProperty()
  stripePaymentIntentId?: string;

  @ApiProperty()
  notes!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ description: 'Whether this is a guest order' })
  isGuestOrder!: boolean;
}

export class OrderResponseDto {
  @ApiProperty({ required: false })
  order?: OrderDto;

  @ApiProperty()
  message!: string;

  @ApiProperty({ required: false })
  clientSecret?: string;

  @ApiProperty({ required: false })
  paymentIntentId?: string;

  @ApiProperty({ required: false })
  orderDetails?: {
    cartId: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    isGuestOrder: boolean;
    guestUserInfo?: ContactInfo;
    shippingAddress: AddressInfo;
    billingAddress: AddressInfo;
    notes?: string;
    userId?: string;
  };
}

export class ConfirmOrderAfterPaymentDto {
  @ApiProperty({ description: 'Payment Intent ID from Stripe' })
  @IsString()
  paymentIntentId!: string;

  @ApiProperty({ description: 'Order details from initial creation' })
  @ValidateNested()
  @Type(() => Object)
  orderDetails!: {
    cartId: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    isGuestOrder: boolean;
    guestUserInfo?: ContactInfo;
    shippingAddress: AddressInfo;
    billingAddress: AddressInfo;
    notes?: string;
    userId?: string;
  };
}
