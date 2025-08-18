import  axiosInstance  from './axios-instance';
import type { Item, ItemQueryParams } from '../modules/items';

const BASE_URL = '/items';

export const itemsApi = {
  // Get all items with pagination and filters
  async getItems(params?: ItemQueryParams): Promise<{
    items: Item[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await axiosInstance.get(BASE_URL, { params });
    return response.data;
  },

  // Get item by ID
  async getItemById(id: string): Promise<Item> {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get featured items
  async getFeaturedItems(): Promise<Item[]> {
    const response = await axiosInstance.get(`${BASE_URL}/featured`);
    return response.data;
  },

  // Get best selling items
  async getBestSellingItems(): Promise<Item[]> {
    const response = await axiosInstance.get(`${BASE_URL}/best-selling`);
    return response.data;
  },

  // Get top rated items
  async getTopRatedItems(minRating?: number, limit?: number): Promise<Item[]> {
    const params: any = {};
    if (minRating) params.minRating = minRating;
    if (limit) params.limit = limit;
    
    const response = await axiosInstance.get(`${BASE_URL}/top-rated`, { params });
    return response.data;
  },

  // Get new arrival items
  async getNewArrivalItems(limit?: number): Promise<Item[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    
    const response = await axiosInstance.get(`${BASE_URL}/new-arrivals`, { params });
    return response.data;
  },

  // Get items by category
  async getItemsByCategory(categoryId: string, params?: Omit<ItemQueryParams, 'categoryId'>): Promise<{
    items: Item[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await axiosInstance.get(`${BASE_URL}/category/${categoryId}`, { params });
    return response.data;
  },

  // Get items by subcategory
  async getItemsBySubcategory(subcategoryId: string, params?: Omit<ItemQueryParams, 'subcategoryId'>): Promise<{
    items: Item[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await axiosInstance.get(`${BASE_URL}/subcategory/${subcategoryId}`, { params });
    return response.data;
  },

  // Search items
  async searchItems(params: ItemQueryParams): Promise<{
    items: Item[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await axiosInstance.get(`${BASE_URL}/search/search`, { params });
    return response.data;
  },

  // Create item (admin only)
  async createItem(data: Partial<Item>): Promise<Item> {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },

  // Update item (admin only)
  async updateItem(id: string, data: Partial<Item>): Promise<Item> {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete item (admin only)
  async deleteItem(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  // Price management (admin only)
  async createPrice(data: any): Promise<any> {
    const response = await axiosInstance.post(`${BASE_URL}/prices`, data);
    return response.data;
  },

  async updatePrice(id: string, data: any): Promise<any> {
    const response = await axiosInstance.put(`${BASE_URL}/prices/${id}`, data);
    return response.data;
  },

  async deletePrice(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/prices/${id}`);
  },

  // Stock management (admin only)
  async createStock(data: any): Promise<any> {
    const response = await axiosInstance.post(`${BASE_URL}/stock`, data);
    return response.data;
  },

  async updateStock(id: string, data: any): Promise<any> {
    const response = await axiosInstance.put(`${BASE_URL}/stock/${id}`, data);
    return response.data;
  },

  async deleteStock(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/stock/${id}`);
  },

  // Image management (admin only)
  async createItemImage(data: any): Promise<any> {
    const response = await axiosInstance.post(`${BASE_URL}/images`, data);
    return response.data;
  },

  async updateItemImage(id: string, data: any): Promise<any> {
    const response = await axiosInstance.put(`${BASE_URL}/images/${id}`, data);
    return response.data;
  },

  async deleteItemImage(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/images/${id}`);
  },

  // Review management
  async createReview(data: any): Promise<any> {
    const response = await axiosInstance.post(`${BASE_URL}/reviews`, data);
    return response.data;
  },

  async updateReview(id: string, data: any): Promise<any> {
    const response = await axiosInstance.put(`${BASE_URL}/reviews/${id}`, data);
    return response.data;
  },

  async deleteReview(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/reviews/${id}`);
  },

  // Rating management
  async createRating(data: any): Promise<any> {
    const response = await axiosInstance.post(`${BASE_URL}/ratings`, data);
    return response.data;
  },

  async updateRating(id: string, data: any): Promise<any> {
    const response = await axiosInstance.put(`${BASE_URL}/ratings/${id}`, data);
    return response.data;
  },

  async deleteRating(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/ratings/${id}`);
  },

  // Favorites management
  async addToFavorites(itemId: string): Promise<any> {
    const response = await axiosInstance.post(`${BASE_URL}/favorites`, { itemId });
    return response.data;
  },

  async removeFromFavorites(itemId: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/favorites/${itemId}`);
  },

  async getUserFavorites(): Promise<any[]> {
    const response = await axiosInstance.get(`${BASE_URL}/favorites/user`);
    return response.data;
  },
};
