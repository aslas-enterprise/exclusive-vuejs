const BASE_URL =
  ((import.meta.env.VITE_APP_BACKEND_URL as string) ??
    'http://localhost:3000') + '/api';
    const AUTH_BASE_URL = BASE_URL + '/auth';

export const BaseUrls = {
  BASE_URL,
  AUTH_BASE_URL,
};