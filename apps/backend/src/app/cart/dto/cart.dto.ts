import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Max, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'Item ID to add to cart' })
  @IsString()
  itemId!: string;

  @ApiProperty({ description: 'Quantity to add', minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  quantity!: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity for the cart item', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  quantity!: number;
}

export class CartItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  item!: any;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CartDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty({ type: [CartItemDto] })
  items!: CartItemDto[];

  @ApiProperty()
  totalItems!: number;

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CartResponseDto {
  @ApiProperty()
  cart!: CartDto;

  @ApiProperty({ required: false })
  message?: string;
}
