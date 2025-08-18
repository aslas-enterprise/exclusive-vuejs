import  axiosInstance  from './axios-instance';
import type { Category, Subcategory, CategoryQueryParams } from '../modules/categories';

const BASE_URL = '/categories';

export const categoriesApi = {
  // Get all categories
  async getCategories(params?: CategoryQueryParams): Promise<Category[]> {
    const response = await axiosInstance.get(BASE_URL, { params });
    return response.data;
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get subcategory by ID
  async getSubcategoryById(id: string): Promise<Subcategory> {
    const response = await axiosInstance.get(`${BASE_URL}/subcategories/${id}`);
    return response.data;
  },

  // Get subcategories by category ID
  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    const response = await axiosInstance.get(`${BASE_URL}/${categoryId}/subcategories`);
    return response.data;
  },

  // Create category (admin only)
  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },

  // Update category (admin only)
  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete category (admin only)
  async deleteCategory(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  // Create subcategory (admin only)
  async createSubcategory(data: Partial<Subcategory>): Promise<Subcategory> {
    const response = await axiosInstance.post(`${BASE_URL}/subcategories`, data);
    return response.data;
  },

  // Update subcategory (admin only)
  async updateSubcategory(id: string, data: Partial<Subcategory>): Promise<Subcategory> {
    const response = await axiosInstance.put(`${BASE_URL}/subcategories/${id}`, data);
    return response.data;
  },

  // Delete subcategory (admin only)
  async deleteSubcategory(id: string): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/subcategories/${id}`);
  },
};
