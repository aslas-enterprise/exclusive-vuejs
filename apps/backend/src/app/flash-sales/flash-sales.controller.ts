import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';
import {
  CreateFlashSaleDto,
  UpdateFlashSaleDto,
  CreateFlashSaleItemDto,
  UpdateFlashSaleItemDto,
  FlashSaleResponseDto,
  FlashSaleItemResponseDto,
} from './dto/flash-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('flash-sales')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  // ===== PUBLIC ENDPOINTS =====

  @Get('active')
  async getActiveFlashSales(): Promise<FlashSaleResponseDto[]> {
    return this.flashSalesService.getActiveFlashSales();
  }

  @Get(':id')
  async getFlashSaleById(@Param('id') id: string): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.getFlashSaleById(id);
  }

  // ===== ADMIN ENDPOINTS =====

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createFlashSale(@Body() createFlashSaleDto: CreateFlashSaleDto): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.createFlashSale(createFlashSaleDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFlashSale(
    @Param('id') id: string,
    @Body() updateFlashSaleDto: UpdateFlashSaleDto,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.updateFlashSale(id, updateFlashSaleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFlashSale(@Param('id') id: string): Promise<void> {
    return this.flashSalesService.deleteFlashSale(id);
  }

  // ===== FLASH SALE ITEMS =====

  @Post(':id/items')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addItemToFlashSale(
    @Param('id') flashSaleId: string,
    @Body() createFlashSaleItemDto: CreateFlashSaleItemDto,
  ): Promise<FlashSaleItemResponseDto> {
    return this.flashSalesService.addItemToFlashSale(flashSaleId, createFlashSaleItemDto);
  }

  @Put('items/:id')
  @UseGuards(JwtAuthGuard)
  async updateFlashSaleItem(
    @Param('id') id: string,
    @Body() updateFlashSaleItemDto: UpdateFlashSaleItemDto,
  ): Promise<FlashSaleItemResponseDto> {
    return this.flashSalesService.updateFlashSaleItem(id, updateFlashSaleItemDto);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItemFromFlashSale(@Param('id') id: string): Promise<void> {
    return this.flashSalesService.removeItemFromFlashSale(id);
  }
}
