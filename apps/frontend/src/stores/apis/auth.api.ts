import { IAuth } from "../modules/auth";
import apiClient from './axios-instance';

const emailLogin = async (payload: IAuth.LoginPayload): Promise<IAuth.AuthResponse> => {
  const response = await apiClient.post('/api/auth/login', payload);
  return response.data;
};

const emailRegister = async (payload: IAuth.RegisterPayload): Promise<IAuth.AuthResponse> => {
  const response = await apiClient.post('/api/auth/register', payload);
  return response.data;
};

const logout = async (): Promise<{ message: string }> => {
  const response = await apiClient.post('/api/auth/logout');
  return response.data;
};

const getCurrentUser = async (): Promise<{ user: IAuth.User }> => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await apiClient.post('/api/auth/forgot-password', { email });
  return response.data;
};

const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  const response = await apiClient.post('/api/auth/reset-password', { token, newPassword });
  return response.data;
};



export const AuthApis = {
  emailLogin,
  emailRegister,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};