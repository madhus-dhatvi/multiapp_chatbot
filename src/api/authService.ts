import apiClient from './client';
import { LoginRequest, LoginResponse, LogoutResponse } from '../types/auth';
import axios from 'axios';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Login failed. Please try again.';
        throw new Error(message);
      }
      throw new Error('An unexpected error occurred.');
    }
  },

  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await apiClient.post<LogoutResponse>('/auth/logout');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Logout failed.';
        throw new Error(message);
      }
      throw new Error('An unexpected error occurred.');
    }
  },
};
