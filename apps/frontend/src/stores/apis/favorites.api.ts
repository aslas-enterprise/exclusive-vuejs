import  axiosInstance  from './axios-instance';

export interface FavoriteItem {
  id: string;
  item: any;
  createdAt: string;
}

export interface FavoriteStatus {
  isFavorited: boolean;
}


export const favoritesApi = {
  // Get user favorites
  getUserFavorites: async (): Promise<FavoriteItem[]> => {
    const response = await axiosInstance.get('/favorites');
    return response.data;
  },

  // Add item to favorites
  addToFavorites: async (itemId: string): Promise<FavoriteItem> => {
    const response = await axiosInstance.post(`/favorites/${itemId}`);
    return response.data;
  },

  // Remove item from favorites
  removeFromFavorites: async (itemId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/favorites/${itemId}`);
    return response.data;
  },

  // Check if item is favorited
  checkFavoriteStatus: async (itemId: string): Promise<FavoriteStatus> => {
    const response = await axiosInstance.get(`/favorites/check/${itemId}`);
    return response.data;
  },
};
