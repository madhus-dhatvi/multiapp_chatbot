import apiClient from './client';
import { VerifyOtpRequest, LoginResponse, LogoutResponse } from '../types/auth';
import axios from 'axios';

export const authService = {
  /**
   * Step 1: Send OTP to the given phone number.
   * Backend expects JSON: { phone: string }
   */
  sendOtp: async (phone: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>(
        '/rider/auth/send-otp',
        { phone } // JSON body as expected by the backend
      );
      return response.data;
    } catch (error) {
      console.error('Send OTP Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Send OTP Response:', JSON.stringify(error.response?.data));
        const data = error.response?.data;
        const message =
          (typeof data === 'string' ? data : data?.message) ||
          `Error ${error.response?.status}: Failed to send OTP.`;
        throw new Error(message);
      }
      throw new Error('An unexpected error occurred.');
    }
  },

  /**
   * Step 2: Verify the OTP and retrieve the auth token.
   * Response: { token: string, message: string }
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/rider/auth/verify-otp',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Verify OTP Response:', JSON.stringify(error.response?.data));
        const data = error.response?.data;
        const message =
          (typeof data === 'string' ? data : data?.message) ||
          `Error ${error.response?.status}: OTP verification failed.`;
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
