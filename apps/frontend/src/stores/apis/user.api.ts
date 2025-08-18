import { IAuth } from "../modules/auth";
import apiClient from './axios-instance';

// Example user API methods using the centralized axios instance
export const UserApis = {
  // Get user profile
  getProfile: async (): Promise<IAuth.User> => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<IAuth.User>): Promise<IAuth.User> => {
    const response = await apiClient.put('/api/users/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post('/api/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
