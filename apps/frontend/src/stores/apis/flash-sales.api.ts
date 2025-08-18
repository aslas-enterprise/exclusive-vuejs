import axiosInstance from './axios-instance';

export interface FlashSaleItem {
  id: string;
  itemId: string;
  salePrice: number;
  originalPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  item?: {
    id: string;
    name: string;
    description?: string;
    images: Array<{ url: string; altText?: string; isPrimary: boolean }>;
    stock?: { quantity: number; isInStock: boolean };
    reviews: Array<{ rating: number }>;
  };
}

export interface FlashSale {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  discount: number;
  createdAt: string;
  updatedAt: string;
  items?: FlashSaleItem[];
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const BASE_URL = '/api/flash-sales';

export const flashSalesApi = {
  // Get active flash sales
  async getActiveFlashSales(): Promise<FlashSale[]> {
    const response = await axiosInstance.get(`${BASE_URL}/active`);
    return response.data;
  },

  // Get flash sale by ID
  async getFlashSaleById(id: string): Promise<FlashSale> {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },
};
