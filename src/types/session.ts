export interface CreateSessionRequest {
  orderId: string;
}

export interface ChatSession {
  sessionId: string;
  appId: string;
  status: string;
  welcomeMessage: string;
  contextOrderId: string;
  startedAt: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  userId: string;
  appId: string;
}

export interface SendMessageResponse {
  reply: string;
  intent: string;
  sessionId: string;
  senderType: string;
  status: string;
  timestamp: string;
}

export interface ChatHistoryMessage {
  id: string;
  senderType: string;
  message: string;
  messageType: string;
  intent: string;
  sentAt: string;
}

export interface SingleChatHistoryResponse {
  sessionId: string;
  appId: string;
  status: string;
  resolutionType: string;
  chatEnabled: boolean;
  contextOrderId: string;
  startedAt: string;
  endedAt: string;
  messages: ChatHistoryMessage[];
}
