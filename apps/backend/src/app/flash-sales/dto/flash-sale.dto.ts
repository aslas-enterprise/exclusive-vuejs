import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlashSaleItemDto {
  @IsString()
  itemId!: string;

  @IsInt()
  @Min(0)
  salePrice!: number;

  @IsInt()
  @Min(0)
  originalPrice!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateFlashSaleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  discount!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFlashSaleItemDto)
  items?: CreateFlashSaleItemDto[];
}

export class UpdateFlashSaleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discount?: number;
}

export class UpdateFlashSaleItemDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  originalPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FlashSaleItemResponseDto {
  id!: string;
  itemId!: string;
  salePrice!: number;
  originalPrice!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  item?: {
    id: string;
    name: string;
    description?: string;
    images: Array<{ url: string; altText?: string; isPrimary: boolean }>;
    stock?: { quantity: number; isInStock: boolean };
    reviews: Array<{ rating: number }>;
  };
}

export class FlashSaleResponseDto {
  id!: string;
  name!: string;
  description?: string;
  startDate!: Date;
  endDate!: Date;
  isActive!: boolean;
  discount!: number;
  createdAt!: Date;
  updatedAt!: Date;
  items?: FlashSaleItemResponseDto[];
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}
