export type ChatMode = 'GUIDED' | 'FREE_CHAT' | 'RESOLVED';

export type ChatMessageType =
  | 'TEXT'
  | 'QUICK_REPLIES'
  | 'RESOLUTION_ACTIONS'
  | 'SYSTEM';

export type ChatSender = 'bot' | 'user' | 'system';

export type ChatOptionActionType =
  | 'CATEGORY'
  | 'QUESTION'
  | 'RESOLVED'
  | 'NOT_RESOLVED';

export interface ChatOption {
  id: string;
  label: string;
  value: string;
  actionType: ChatOptionActionType;
  disabled?: boolean;
}

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  sender: ChatSender;
  text?: string;
  timestamp: number;
  options?: ChatOption[];
  selectedOptionId?: string;
  isLoading?: boolean;
  isError?: boolean;
  metadata?: {
    faqId?: string;
    intent?: string;
    category?: string;
    sessionId?: string;
    [key: string]: any;
  };
}
