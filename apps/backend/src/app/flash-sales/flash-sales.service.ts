import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFlashSaleDto,
  UpdateFlashSaleDto,
  CreateFlashSaleItemDto,
  UpdateFlashSaleItemDto,
  FlashSaleResponseDto,
  FlashSaleItemResponseDto,
} from './dto/flash-sale.dto';

@Injectable()
export class FlashSalesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFlashSale(createFlashSaleDto: CreateFlashSaleDto): Promise<FlashSaleResponseDto> {
    const { items, ...flashSaleData } = createFlashSaleDto;

    const flashSale = await this.prisma.flashSale.create({
      data: {
        ...flashSaleData,
        startDate: new Date(flashSaleData.startDate),
        endDate: new Date(flashSaleData.endDate),
      },
    });

    // Create flash sale items if provided
    if (items && items.length > 0) {
      await Promise.all(
        items.map((item) =>
          this.prisma.flashSaleItem.create({
            data: {
              ...item,
              flashSaleId: flashSale.id,
            },
          }),
        ),
      );
    }

    return this.mapToFlashSaleResponse(flashSale);
  }

  async getActiveFlashSales(): Promise<FlashSaleResponseDto[]> {
    const now = new Date();
    
    const flashSales = await this.prisma.flashSale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        items: {
          where: { isActive: true },
          include: {
            item: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                },
                stock: true,
                reviews: {
                  where: { isApproved: true },
                },
              },
            },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    return flashSales.map((flashSale) => this.mapToFlashSaleResponse(flashSale));
  }

  async getFlashSaleById(id: string): Promise<FlashSaleResponseDto> {
    const flashSale = await this.prisma.flashSale.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          include: {
            item: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                },
                stock: true,
                reviews: {
                  where: { isApproved: true },
                },
              },
            },
          },
        },
      },
    });

    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID ${id} not found`);
    }

    return this.mapToFlashSaleResponse(flashSale);
  }

  async updateFlashSale(id: string, updateFlashSaleDto: UpdateFlashSaleDto): Promise<FlashSaleResponseDto> {
    const flashSale = await this.prisma.flashSale.update({
      where: { id },
      data: {
        ...updateFlashSaleDto,
        ...(updateFlashSaleDto.startDate && { startDate: new Date(updateFlashSaleDto.startDate) }),
        ...(updateFlashSaleDto.endDate && { endDate: new Date(updateFlashSaleDto.endDate) }),
      },
    });

    return this.mapToFlashSaleResponse(flashSale);
  }

  async deleteFlashSale(id: string): Promise<void> {
    await this.prisma.flashSale.delete({
      where: { id },
    });
  }

  async addItemToFlashSale(flashSaleId: string, createFlashSaleItemDto: CreateFlashSaleItemDto): Promise<FlashSaleItemResponseDto> {
    const flashSaleItem = await this.prisma.flashSaleItem.create({
      data: {
        ...createFlashSaleItemDto,
        flashSaleId,
      },
      include: {
        item: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
            stock: true,
            reviews: {
              where: { isApproved: true },
            },
          },
        },
      },
    });

    return this.mapToFlashSaleItemResponse(flashSaleItem);
  }

  async updateFlashSaleItem(id: string, updateFlashSaleItemDto: UpdateFlashSaleItemDto): Promise<FlashSaleItemResponseDto> {
    const flashSaleItem = await this.prisma.flashSaleItem.update({
      where: { id },
      data: updateFlashSaleItemDto,
      include: {
        item: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
            stock: true,
            reviews: {
              where: { isApproved: true },
            },
          },
        },
      },
    });

    return this.mapToFlashSaleItemResponse(flashSaleItem);
  }

  async removeItemFromFlashSale(id: string): Promise<void> {
    await this.prisma.flashSaleItem.delete({
      where: { id },
    });
  }

  private calculateTimeRemaining(endDate: Date): { days: number; hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  private mapToFlashSaleItemResponse(flashSaleItem: any): FlashSaleItemResponseDto {
    return {
      id: flashSaleItem.id,
      itemId: flashSaleItem.itemId,
      salePrice: Number(flashSaleItem.salePrice),
      originalPrice: Number(flashSaleItem.originalPrice),
      isActive: flashSaleItem.isActive,
      createdAt: flashSaleItem.createdAt,
      updatedAt: flashSaleItem.updatedAt,
      item: flashSaleItem.item ? {
        id: flashSaleItem.item.id,
        name: flashSaleItem.item.name,
        description: flashSaleItem.item.description,
        images: flashSaleItem.item.images.map((img: any) => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
        })),
        stock: flashSaleItem.item.stock ? {
          quantity: flashSaleItem.item.stock.quantity,
          isInStock: flashSaleItem.item.stock.isInStock,
        } : undefined,
        reviews: flashSaleItem.item.reviews.map((review: any) => ({
          rating: review.rating,
        })),
      } : undefined,
    };
  }

  private mapToFlashSaleResponse(flashSale: any): FlashSaleResponseDto {
    return {
      id: flashSale.id,
      name: flashSale.name,
      description: flashSale.description,
      startDate: flashSale.startDate,
      endDate: flashSale.endDate,
      isActive: flashSale.isActive,
      discount: flashSale.discount,
      createdAt: flashSale.createdAt,
      updatedAt: flashSale.updatedAt,
      items: flashSale.items?.map((item: any) => this.mapToFlashSaleItemResponse(item)),
      timeRemaining: this.calculateTimeRemaining(flashSale.endDate),
    };
  }
}
