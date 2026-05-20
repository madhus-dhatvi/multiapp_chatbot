import apiClient from './client';
import { RecentOrder } from '../types/order';
import { ChatSession, CreateSessionRequest, SendMessageRequest, SendMessageResponse } from '../types/session';
import { storage } from '../utils/storage';
import axios from 'axios';

export const orderService = {
  getRecentOrders: async (): Promise<RecentOrder[]> => {
    try {
      const token = await storage.getToken();
      const response = await apiClient.get('/rider/api/chat/orders/recent', {
        params: token ? { riderToken: token } : undefined,
      });
      console.log('recent orders response by mahi', response.data);
      
      let ordersData: RecentOrder[] = [];
      
      // If the backend returns a formatted string instead of JSON
      if (typeof response.data === 'string') {
        const lines = response.data.split('\n');
        ordersData = lines
          .filter(line => line.trim().startsWith('•'))
          .map((line, index) => {
            // Expected format: "• ORD-6E783686 | Rs.165 | DELIVERED"
            const parts = line.replace('•', '').split('|').map(p => p.trim());
            
            const orderId = parts[0] || `ORD-UNKNOWN-${index}`;
            const amountStr = parts[1] ? parts[1].replace('Rs.', '').trim() : '0';
            const amount = parseFloat(amountStr) || 0;
            const status = parts[2] || 'UNKNOWN';
            
            return {
              orderId: orderId,
              externalOrderId: orderId,
              restaurantName: 'Restaurant', // Default placeholder
              orderStatus: status,
              totalAmount: amount,
              itemsSummary: '',
              placedAt: new Date().toISOString(), // Default to now as we don't have the date
            } as RecentOrder;
          });
      } else {
        // Fallback for when backend starts returning proper JSON
        ordersData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.data || response.data?.orders || []);
      }
      
      return ordersData;
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
      const token = await storage.getToken();
      const response = await apiClient.post<ChatSession>(
        '/rider/api/chat/start',
        { ...data, riderToken: token },
      );
      console.log("session creation by mahi",response.data)
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

  // sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  //   try {
  //     const response = await apiClient.post<SendMessageResponse>(
  //       '/api/chat/message',
  //       data,
  //     );
  //     return response.data;
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       const message =
  //         error.response?.data?.message || 'Failed to send message.';
  //       throw new Error(message);
  //     }
  //     throw new Error('An unexpected error occurred.');
  //   }
  // },
};
