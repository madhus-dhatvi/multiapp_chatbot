import { FAQCategory, Question } from '../data/faqs';

export type RootStackParamList = {
  Login: undefined;
  SupportHome: undefined;
  CategoryQuestions: { category: FAQCategory };
  Answer: { categoryTitle: string; question: Question };
};
