import client from './client';
import {
  FaqAnswer,
  FaqCategory,
  FaqQuestion,
  ResolveChatResponse,
} from '../types/faq';

import {
  SingleChatHistoryResponse,
} from '../types/session';

export interface StartChatPayload {
  orderId: string;
}

export interface StartChatResponse {
  sessionId: string;
  appId: string;
  welcomeMessage: string;
  status: string;
  contextOrderId: string;
  startedAt: string;
}

export interface SendChatMessagePayload {
  sessionId: string;
  message: string;
  userId: string;
  appId: string;
}

export interface SendChatMessageResponse {
  reply: string;
  intent: string;
  sessionId: string;
  senderType: string;
  status: string;
  timestamp: string;
}

export const supportService = {
  async startChatSession(payload: StartChatPayload) {
    const response = await client.post<StartChatResponse>(
      '/api/chat/start',
      payload,
    );

    return response.data;
  },

  async getFaqCategories() {
    const response = await client.get<FaqCategory[]>('/api/faq/categories');

    return response.data;
  },

  async getFaqQuestions(category: string) {
    const response = await client.get<FaqQuestion[]>(
      `/api/faq/questions/${category}`,
    );

    return response.data;
  },

  async getFaqAnswer(
    faqId: string,
    params: {
      orderId?: string;
      sessionId?: string;
    },
  ) {
    const response = await client.get<FaqAnswer>(
      `/api/faq/answer/${faqId}`,
      {
        params,
      },
    );

    return response.data;
  },

  async resolveChat(payload: {
    sessionId: string;
    resolved: boolean;
  }) {
    const response = await client.post<ResolveChatResponse>(
      '/api/chat/resolve',
      payload,
    );

    return response.data;
  },

  async sendChatMessage(payload: SendChatMessagePayload) {
    const response = await client.post<SendChatMessageResponse>(
      '/api/chat/message',
      payload,
    );

    return response.data;
  },

    async getChatHistory(
  sessionId: string,
): Promise<SingleChatHistoryResponse> {
  const response = await client.get(
    `/api/chat/history/${sessionId}`,
  );

  return response.data;
},

  async endChatSession(sessionId: string) {
    const response = await client.post<ResolveChatResponse>(
      `/api/chat/end/${sessionId}`,
    );

    return response.data;
  },
};
