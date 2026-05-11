import { ChatMessage, ChatOption } from '../types/chat';

const createBaseMessage = (
  partial: Partial<ChatMessage>,
): ChatMessage => ({
  id: `${Date.now()}-${Math.random()}`,
  timestamp: Date.now(),
  sender: 'bot',
  type: 'TEXT',
  ...partial,
});

export const messageFactory = {
  createTextMessage(
    text: string,
    sender: 'bot' | 'user' | 'system' = 'bot',
  ): ChatMessage {
    return createBaseMessage({
      text,
      sender,
      type: 'TEXT',
    });
  },

  createQuickReplyMessage(options: ChatOption[]): ChatMessage {
    return createBaseMessage({
      type: 'QUICK_REPLIES',
      options,
      sender: 'bot',
    });
  },

  createResolutionMessage(): ChatMessage {
    return createBaseMessage({
      type: 'RESOLUTION_ACTIONS',
      sender: 'bot',
    });
  },

  createSystemMessage(text: string): ChatMessage {
    return createBaseMessage({
      text,
      sender: 'system',
      type: 'SYSTEM',
    });
  },
};
