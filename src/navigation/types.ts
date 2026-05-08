import { FAQCategory, Question } from '../data/faqs';
import { ChatSession } from '../types/session';
import { RecentOrder } from '../types/order';

export type RootStackParamList = {
  Login: undefined;
  SupportHome: undefined;
  CategoryQuestions: { category: FAQCategory };
  Answer: { categoryTitle: string; question: Question };
  ChatScreen: { session: ChatSession; order: RecentOrder };
};
