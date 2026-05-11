export interface FaqCategory {
  category: string;
  displayName: string;
  displayOrder: number;
}

export interface FaqQuestion {
  faqId: string;
  question: string;
  category: string;
  intent: string;
  displayOrder: number;
}

export interface FaqAnswer {
  faqId: string;
  question: string;
  answer: string;
  intent: string;
  category: string;
  needsTicket: boolean;
  ticketId?: string;
}

export interface ResolveChatResponse {
  sessionId: string;
  status: string;
  chatEnabled: boolean;
  resolutionType: string;
  message: string;
  timestamp: string;
}
