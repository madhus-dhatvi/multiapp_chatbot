import { useRef } from 'react';
import { FaqQuestion } from '../types/faq';

export const useFaqCache = () => {
  const questionsCache = useRef<Record<string, FaqQuestion[]>>({});

  const getCachedQuestions = (category: string) => {
    return questionsCache.current[category];
  };

  const setCachedQuestions = (
    category: string,
    questions: FaqQuestion[],
  ) => {
    questionsCache.current[category] = questions;
  };

  return {
    getCachedQuestions,
    setCachedQuestions,
  };
};
