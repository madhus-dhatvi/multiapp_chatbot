import { supportService } from '../api/supportService';

import {
  FaqAnswer,
  FaqCategory,
  FaqQuestion,
} from '../types/faq';

import { sortByDisplayOrder } from '../utils/chatHelpers';

import client from '../api/client';

export const chatFlowService = {
  async loadCategories(): Promise<FaqCategory[]> {
    const categories =
      await supportService.getFaqCategories();

    return sortByDisplayOrder(categories);
  },

  async loadQuestions(
    category: string,
  ): Promise<FaqQuestion[]> {
    const questions =
      await supportService.getFaqQuestions(category);

    return sortByDisplayOrder(questions);
  },

  async loadAnswer(
    faqId: string,
    orderId: string,
    sessionId: string,
  ): Promise<FaqAnswer> {
    return supportService.getFaqAnswer(faqId, {
      orderId,
      sessionId,
    });
  },

  async resolveIssue(
    sessionId: string,
    resolved: boolean,
  ) {
    return supportService.resolveChat({
      sessionId,
      resolved,
    });
  },

  async sendFreeChatMessage(payload: {
    sessionId: string;
    message: string;
    userId: string;
    appId: string;
  }) {
    return supportService.sendChatMessage(payload);
  },

  async endSupportChat(sessionId: string) {
    return supportService.endChatSession(sessionId);
  },

  getChatHistory: async () => {
    const response = await client.get(
      '/api/chat/history',
    );

    return response.data;
  },

  endChatSession: async (
    sessionId: string,
  ) => {
    const response = await client.post(
      `/api/chat/end/${sessionId}`,
    );

    return response.data;
  },
};