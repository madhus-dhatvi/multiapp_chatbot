import axios from 'axios';
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

const DEFAULT_ERROR_MESSAGE =
  'Something went wrong. Please try again.';

const NETWORK_ERROR_MESSAGE =
  'Network error. Please check your internet connection.';

const TIMEOUT_ERROR_MESSAGE =
  'Request timeout. Please try again.';

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return TIMEOUT_ERROR_MESSAGE;
    }

    if (!error.response) {
      return NETWORK_ERROR_MESSAGE;
    }

    return (
      error.response.data?.message ||
      error.response.data?.error ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const validateSessionId = (
  sessionId?: string,
) => {
  if (!sessionId?.trim()) {
    throw new Error('Invalid session id.');
  }
};

const validateCategory = (
  category?: string,
) => {
  if (!category?.trim()) {
    throw new Error('Invalid category.');
  }
};

const validateFaqId = (
  faqId?: string,
) => {
  if (!faqId?.trim()) {
    throw new Error('Invalid FAQ id.');
  }
};

const validateMessage = (
  message?: string,
) => {
  if (!message?.trim()) {
    throw new Error('Message cannot be empty.');
  }

  if (message.trim().length > 1000) {
    throw new Error(
      'Message exceeds allowed limit.',
    );
  }
};

export const supportService = {
  async startChatSession(
    payload: StartChatPayload,
  ): Promise<StartChatResponse> {
    try {
      if (!payload?.orderId?.trim()) {
        throw new Error('Invalid order id.');
      }

      const response =
        await client.post<StartChatResponse>(
          '/api/chat/start',
          payload,
        );

      if (!response?.data?.sessionId) {
        throw new Error(
          'Invalid session response.',
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to start support chat.',
        ),
      );
    }
  },

  async getFaqCategories(): Promise<
    FaqCategory[]
  > {
    try {
      const response =
        await client.get<FaqCategory[]>(
          '/api/faq/categories',
        );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.filter(
        item =>
          item?.category &&
          item?.displayName,
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to load categories.',
        ),
      );
    }
  },

  async getFaqQuestions(
    category: string,
  ): Promise<FaqQuestion[]> {
    try {
      validateCategory(category);

      const response =
        await client.get<FaqQuestion[]>(
          `/api/faq/questions/${encodeURIComponent(
            category,
          )}`,
        );

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data.filter(
        item =>
          item?.faqId &&
          item?.question,
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to load questions.',
        ),
      );
    }
  },

  async getFaqAnswer(
    faqId: string,
    params: {
      orderId?: string;
      sessionId?: string;
    },
  ): Promise<FaqAnswer> {
    try {
      validateFaqId(faqId);

      const response =
        await client.get<FaqAnswer>(
          `/api/faq/answer/${encodeURIComponent(
            faqId,
          )}`,
          {
            params,
          },
        );

      if (!response?.data?.answer) {
        throw new Error(
          'Answer not available.',
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to load answer.',
        ),
      );
    }
  },

  async resolveChat(payload: {
    sessionId: string;
    resolved: boolean;
  }): Promise<ResolveChatResponse> {
    try {
      validateSessionId(
        payload?.sessionId,
      );

      if (
        typeof payload?.resolved !==
        'boolean'
      ) {
        throw new Error(
          'Invalid resolution status.',
        );
      }

      const response =
        await client.post<ResolveChatResponse>(
          '/api/chat/resolve',
          payload,
        );

      if (!response?.data) {
        throw new Error(
          'Invalid resolve response.',
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to resolve chat.',
        ),
      );
    }
  },

  async sendChatMessage(
    payload: SendChatMessagePayload,
  ): Promise<SendChatMessageResponse> {
    try {
      validateSessionId(
        payload?.sessionId,
      );

      validateMessage(
        payload?.message,
      );

      if (!payload?.userId?.trim()) {
        throw new Error('Invalid user id.');
      }

      if (!payload?.appId?.trim()) {
        throw new Error('Invalid app id.');
      }

      const response =
        await client.post<SendChatMessageResponse>(
          '/api/chat/message',
          {
            ...payload,
            message:
              payload.message.trim(),
          },
        );

      if (!response?.data?.reply) {
        throw new Error(
          'Empty response received.',
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to send message.',
        ),
      );
    }
  },

  async getChatHistory(
    sessionId: string,
  ): Promise<SingleChatHistoryResponse> {
    try {
      validateSessionId(sessionId);

      const response =
        await client.get<SingleChatHistoryResponse>(
          `/api/chat/history/${encodeURIComponent(
            sessionId,
          )}`,
        );

      if (!response?.data?.sessionId) {
        throw new Error(
          'Invalid history response.',
        );
      }

      return {
        ...response.data,
        messages: Array.isArray(
          response.data.messages,
        )
          ? response.data.messages
          : [],
      };
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to load chat history.',
        ),
      );
    }
  },

  async endChatSession(
    sessionId: string,
  ): Promise<ResolveChatResponse> {
    try {
      validateSessionId(sessionId);

      const response =
        await client.post<ResolveChatResponse>(
          `/api/chat/end/${encodeURIComponent(
            sessionId,
          )}`,
        );

      if (!response?.data) {
        throw new Error(
          'Invalid end session response.',
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Failed to end support session.',
        ),
      );
    }
  },
};