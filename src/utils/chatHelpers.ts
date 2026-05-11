import { ChatMessage } from '../types/chat';

export const formatChatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const sortByDisplayOrder = <T extends { displayOrder: number }>(
  items: T[],
): T[] => {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
};

export const disableMessageOptions = (
  message: ChatMessage,
  selectedId?: string,
): ChatMessage => {
  if (!message.options) {
    return message;
  }

  return {
    ...message,
    selectedOptionId: selectedId,
    options: message.options.map(option => ({
      ...option,
      disabled: true,
    })),
  };
};
