import apiClient from './client';
import { RecentOrder } from '../types/order';
import { ChatSession, CreateSessionRequest, SendMessageRequest, SendMessageResponse } from '../types/session';
import axios from 'axios';

export const orderService = {
  getRecentOrders: async (): Promise<RecentOrder[]> => {
    try {
      const response = await apiClient.get<RecentOrder[]>('/api/chat/orders/recent');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Failed to fetch recent orders.';
        throw new Error(message);
      }
      throw new Error('An unexpected error occurred.');
    }
  },

  createSession: async (data: CreateSessionRequest): Promise<ChatSession> => {
    try {
      const response = await apiClient.post<ChatSession>(
        '/api/chat/start',
        data,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Failed to create chat session.';
        throw new Error(message);
      }
      throw new Error('An unexpected error occurred.');
    }
  },

  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    try {
      const response = await apiClient.post<SendMessageResponse>(
        '/api/chat/message',
        data,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Failed to send message.';
        throw new Error(message);
      }
      throw new Error('An unexpected error occurred.');
    }
  },
};
