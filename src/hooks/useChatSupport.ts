import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supportService } from '../api/supportService';
import { CHAT_DELAYS } from '../data/chatConfig';
import { messageFactory } from '../services/messageFactory';
import { ChatMessage, ChatMode } from '../types/chat';
import { FaqCategory, FaqQuestion } from '../types/faq';
import { delay } from '../utils/delay';
import { disableMessageOptions, sortByDisplayOrder } from '../utils/chatHelpers';
import { useFaqCache } from './useFaqCache';

interface Params {
  session: any;
  order: any;
  user: any;
}

export const useChatSupport = ({ session, order, user }: Params) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMode, setChatMode] = useState<ChatMode>('GUIDED');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [requestLock, setRequestLock] = useState(false);

  const mountedRef = useRef(true);

  const { getCachedQuestions, setCachedQuestions } = useFaqCache();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSetState = useCallback((callback: () => void) => {
    if (mountedRef.current) {
      callback();
    }
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    safeSetState(() => {
      setMessages(prev => [...prev, message]);
    });
  }, [safeSetState]);

  const updateLastInteractiveMessage = useCallback((
    selectedId: string,
  ) => {
    safeSetState(() => {
      setMessages(prev => {
        const copy = [...prev];

        for (let i = copy.length - 1; i >= 0; i--) {
          if (
            copy[i].type === 'QUICK_REPLIES' ||
            copy[i].type === 'RESOLUTION_ACTIONS'
          ) {
            copy[i] = disableMessageOptions(copy[i], selectedId);
            break;
          }
        }

        return copy;
      });
    });
  }, [safeSetState]);

  const loadCategories = useCallback(async () => {
    try {
      setIsTyping(true);

      const categories = await supportService.getFaqCategories();

      const sortedCategories = sortByDisplayOrder(categories);

      await delay(CHAT_DELAYS.CATEGORY);

      const options = sortedCategories.map(category => ({
        id: category.category,
        label: category.displayName,
        value: category.category,
        actionType: 'CATEGORY' as const,
      }));

      appendMessage(
        messageFactory.createQuickReplyMessage(options),
      );
    } catch (error) {
      appendMessage(
        messageFactory.createSystemMessage(
          'Failed to load support categories.',
        ),
      );
    } finally {
      setIsTyping(false);
    }
  }, [appendMessage]);

  useEffect(() => {
    if (session?.welcomeMessage) {
      appendMessage(
        messageFactory.createTextMessage(session.welcomeMessage),
      );

      loadCategories();
    }
  }, [session]);

  const handleCategorySelection = async (
    category: FaqCategory,
    messageId: string,
  ) => {
    if (requestLock) {
      return;
    }

    try {
      setRequestLock(true);

      updateLastInteractiveMessage(category.category);

      appendMessage(
        messageFactory.createTextMessage(category.displayName, 'user'),
      );

      setIsTyping(true);

      let questions = getCachedQuestions(category.category);

      if (!questions) {
        questions = await supportService.getFaqQuestions(category.category);
        questions = sortByDisplayOrder(questions);

        setCachedQuestions(category.category, questions);
      }

      await delay(CHAT_DELAYS.QUESTION);

      if (!questions.length) {
        appendMessage(
          messageFactory.createSystemMessage(
            'No support options available currently.',
          ),
        );

        await loadCategories();

        return;
      }

      appendMessage(
        messageFactory.createQuickReplyMessage(
          questions.map(question => ({
            id: question.faqId,
            label: question.question,
            value: question.faqId,
            actionType: 'QUESTION',
          })),
        ),
      );
    } catch (error) {
      appendMessage(
        messageFactory.createSystemMessage(
          'Failed to load support questions.',
        ),
      );
    } finally {
      setRequestLock(false);
      setIsTyping(false);
    }
  };

  const handleQuestionSelection = async (question: FaqQuestion) => {
    if (requestLock) {
      return;
    }

    try {
      setRequestLock(true);

      updateLastInteractiveMessage(question.faqId);

      appendMessage(
        messageFactory.createTextMessage(question.question, 'user'),
      );

      setIsTyping(true);

      const answer = await supportService.getFaqAnswer(question.faqId, {
        orderId: order.orderId,
        sessionId: session.sessionId,
      });

      await delay(CHAT_DELAYS.ANSWER);

      appendMessage(
        messageFactory.createTextMessage(answer.answer),
      );

      appendMessage(
        messageFactory.createResolutionMessage(),
      );
    } catch (error) {
      appendMessage(
        messageFactory.createSystemMessage(
          'Failed to load answer. Please try again.',
        ),
      );
    } finally {
      setRequestLock(false);
      setIsTyping(false);
    }
  };

  const handleResolution = async (resolved: boolean) => {
    if (requestLock) {
      return;
    }

    try {
      setRequestLock(true);

      updateLastInteractiveMessage(
        resolved ? 'resolved' : 'not_resolved',
      );

      appendMessage(
        messageFactory.createTextMessage(
          resolved ? 'Issue Resolved' : 'Issue Not Resolved',
          'user',
        ),
      );

      setIsTyping(true);

      const response = await supportService.resolveChat({
        sessionId: session.sessionId,
        resolved,
      });

      await delay(CHAT_DELAYS.RESOLUTION);

      appendMessage(
        messageFactory.createSystemMessage(response.message),
      );

      if (response.chatEnabled) {
        setChatMode('FREE_CHAT');

        appendMessage(
          messageFactory.createSystemMessage(
            'You are now connected to support chat.',
          ),
        );
      } else {
        setChatMode('RESOLVED');
      }
    } catch (error) {
      appendMessage(
        messageFactory.createSystemMessage(
          'Failed to update resolution state.',
        ),
      );
    } finally {
      setRequestLock(false);
      setIsTyping(false);
    }
  };

  const sendFreeMessage = async () => {
    const trimmed = inputText.trim();

    if (!trimmed || requestLock || chatMode !== 'FREE_CHAT') {
      return;
    }

    try {
      setRequestLock(true);

      const userMessage = messageFactory.createTextMessage(
        trimmed,
        'user',
      );

      appendMessage(userMessage);

      setInputText('');

      setIsTyping(true);

      const response = await supportService.sendChatMessage({
        sessionId: session.sessionId,
        message: trimmed,
        userId: user?.sub || '',
        appId: session.appId,
      });

      await delay(CHAT_DELAYS.FREE_CHAT);

      appendMessage(
        messageFactory.createTextMessage(response.reply),
      );
    } catch (error) {
      appendMessage(
        messageFactory.createSystemMessage(
          'Failed to send message.',
        ),
      );
    } finally {
      setRequestLock(false);
      setIsTyping(false);
    }
  };

  return {
    messages,
    chatMode,
    inputText,
    setInputText,
    isTyping,
    handleCategorySelection,
    handleQuestionSelection,
    handleResolution,
    sendFreeMessage,
  };
};