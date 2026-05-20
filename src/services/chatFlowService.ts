import { supportService } from '../api/supportService';

import {
  FaqAnswer,
  FaqCategory,
  FaqQuestion,
} from '../types/faq';

import { sortByDisplayOrder } from '../utils/chatHelpers';

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
    sessionId: string,
  ): Promise<FaqAnswer> {
    return supportService.getFaqAnswer(faqId, sessionId);
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
    return supportService.getAllChatHistory();
  },

  endChatSession: async (
    sessionId: string,
  ) => {
    return supportService.endChatSession(sessionId);
  },
};