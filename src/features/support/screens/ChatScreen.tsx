import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import Svg, { Path, Circle } from 'react-native-svg';

import { colors } from '../../../theme';
import { RootStackParamList } from '../../../navigation/types';
import { RootState } from '../../../store';

import { supportService } from '../../../api/supportService';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ChatScreen'
>;

type ChatMode =
  | 'GUIDED'
  | 'FREE_CHAT'
  | 'RESOLVED';

type MessageType =
  | 'TEXT'
  | 'OPTIONS'
  | 'RESOLUTION';

type OptionAction =
  | 'CATEGORY'
  | 'QUESTION';

interface ChatOption {
  id: string;
  label: string;
  value: string;
  action: OptionAction;
  disabled?: boolean;
}

interface Message {
  id: string;
  type: MessageType;
  text?: string;
  sender: 'bot' | 'user' | 'system';
  timestamp: number;
  isError?: boolean;
  options?: ChatOption[];
  selectedOptionId?: string;
}

interface FAQCategory {
  category: string;
  displayName: string;
  displayOrder: number;
}

interface FAQQuestion {
  faqId: string;
  question: string;
  category: string;
  intent: string;
  displayOrder: number;
}

const RESPONSE_DELAY = 450;

const SendIcon = () => (
  <Svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={colors.cardBackground}
    stroke={colors.cardBackground}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M22 2L11 13" />
    <Path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </Svg>
);

const BotIcon = () => (
  <Svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.secondary}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M12 8V4H8" />
    <Circle cx="12" cy="14" r="8" />
    <Path d="M9 17l1.5-1.5" />
    <Path d="M15 17l-1.5-1.5" />
  </Svg>
);

const OrderInfoIcon = () => (
  <Svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={colors.secondary}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M16.5 9.4l-9-5.19" />
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <Path d="M3.27 6.96L12 12.01l8.73-5.05" />
    <Path d="M12 22.08V12" />
  </Svg>
);

const TypingIndicator = () => (
  <View style={[msgStyles.row, msgStyles.botRow]}>
    <View style={msgStyles.avatar}>
      <BotIcon />
    </View>

    <View
      style={[
        msgStyles.bubble,
        msgStyles.botBubble,
        msgStyles.typingBubble,
      ]}>
      <ActivityIndicator
        size="small"
        color={colors.secondary}
      />

      <Text style={msgStyles.typingText}>
        Typing...
      </Text>
    </View>
  </View>
);

export const ChatScreen = ({ route }: Props) => {
  const { session, order } = route.params;

  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [chatMode, setChatMode] = useState<ChatMode>('GUIDED');

  const questionCache = useRef<
    Record<string, FAQQuestion[]>
  >({});

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({
        animated: true,
      });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const wait = (ms: number) =>
    new Promise(resolve => setTimeout(() => resolve(undefined), ms));

  const appendMessage = useCallback(
    (message: Message) => {
      setMessages(prev => [...prev, message]);
    },
    [],
  );

  const collapseOptions = (
    selectedId: string,
  ) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.type !== 'OPTIONS') {
          return msg;
        }

        const hasSelected =
          msg.options?.some(
            o => o.id === selectedId,
          ) ?? false;

        if (!hasSelected) {
          return msg;
        }

        return {
          ...msg,
          selectedOptionId: selectedId,
          options: msg.options?.filter(
            o => o.id === selectedId,
          ) || [],
        };
      }),
    );
  };

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    if (!session?.welcomeMessage) {
      return;
    }

    try {
      setIsTyping(true);

      const categories: FAQCategory[] =
        await supportService.getFaqCategories();

      await wait(RESPONSE_DELAY);
      console.log(categories);

      const sorted = [...categories].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder,
      );

      appendMessage({
        id: `welcome-${Date.now()}`,
        type: 'OPTIONS',
        text: 'Which concern may i help you with?',
        sender: 'bot',
        timestamp: new Date(
          session.startedAt,
        ).getTime(),
        options: sorted.map(
          (category, index) => ({
            id: `${category.category}-${Date.now()}-${index}`,
            label: category.displayName,
            value: category.category,
            action: 'CATEGORY',
          }),
        ),
      });
    } catch {
      appendMessage({
        id: `cat-error-${Date.now()}`,
        type: 'TEXT',
        text: 'Failed to load support categories.',
        sender: 'system',
        timestamp: Date.now(),
        isError: true,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsTyping(true);

      const categories: FAQCategory[] =
        await supportService.getFaqCategories();

      await wait(RESPONSE_DELAY);

      const sorted = [...categories].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder,
      );

      appendMessage({
        id: `categories-${Date.now()}`,
        type: 'OPTIONS',
        sender: 'bot',
        timestamp: Date.now(),
        text: 'Which concern may i help you with?',
        options: sorted.map((category, index) => ({
          id: `${category.category}-${Date.now()}-${index}`,
          label: category.displayName,
          value: category.category,
          action: 'CATEGORY',
        })),
      });
    } catch {
      appendMessage({
        id: `cat-error-${Date.now()}`,
        type: 'TEXT',
        text: 'Failed to load support categories.',
        sender: 'system',
        timestamp: Date.now(),
        isError: true,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleCategoryPress = async (
    option: ChatOption,
  ) => {
    if (isSending) {
      return;
    }

    try {
      setIsSending(true);

      collapseOptions(option.id);

      appendMessage({
        id: `user-cat-${Date.now()}`,
        type: 'TEXT',
        text: option.label,
        sender: 'user',
        timestamp: Date.now(),
      });

      setIsTyping(true);

      let questions =
        questionCache.current[option.value];

      if (!questions) {
        questions =
          await supportService.getFaqQuestions(
            option.value,
          );

        console.log(
          '[FAQ questions response]',
          option.value,
          JSON.stringify(questions),
        );

        questionCache.current[option.value] =
          questions;
      }

      await wait(RESPONSE_DELAY);

      appendMessage({
        id: `questions-${Date.now()}`,
        type: 'OPTIONS',
        text: 'Which concern may i help you with?',
        sender: 'bot',
        timestamp: Date.now(),
        options: questions.map((question, index) => ({
          id: `${question.faqId}-${Date.now()}-${index}`,
          label: question.question,
          value: question.faqId,
          action: 'QUESTION',
        })),
      });
    } catch (error: any) {
      appendMessage({
        id: `question-error-${Date.now()}`,
        type: 'TEXT',
        text: error?.message || 'Failed to load support questions.',
        sender: 'system',
        timestamp: Date.now(),
        isError: true,
      });
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleQuestionPress = async (
    option: ChatOption,
  ) => {
    if (isSending) {
      return;
    }

    try {
      setIsSending(true);

      collapseOptions(option.id);

      appendMessage({
        id: `user-question-${Date.now()}`,
        type: 'TEXT',
        text: option.label,
        sender: 'user',
        timestamp: Date.now(),
      });

      setIsTyping(true);

      const answer =
        await supportService.getFaqAnswer(
          option.value,
          session.sessionId,
        );

      console.log(
        '[FAQ answer response]',
        option.value,
        'sessionId=',
        session.sessionId,
        'answer=',
        JSON.stringify(answer),
      );

      await wait(600);

      appendMessage({
        id: `answer-${Date.now()}`,
        type: 'TEXT',
        text: answer.answer,
        sender: 'bot',
        timestamp: Date.now(),
      });

      appendMessage({
        id: `resolution-${Date.now()}`,
        type: 'RESOLUTION',
        sender: 'bot',
        timestamp: Date.now(),
      });
    } catch (error: any) {
      appendMessage({
        id: `answer-error-${Date.now()}`,
        type: 'TEXT',
        text: error?.message || 'Failed to fetch answer.',
        sender: 'system',
        timestamp: Date.now(),
        isError: true,
      });
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleResolution = async (
    resolved: boolean,
    messageId: string,
  ) => {
    if (isSending) {
      return;
    }

    try {
      setIsSending(true);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                selectedOptionId: resolved ? 'yes' : 'no',
              }
            : msg,
        ),
      );

      appendMessage({
        id: `resolution-user-${Date.now()}`,
        type: 'TEXT',
        text: resolved
          ? 'Back to categories'
          : 'Issue not resolved',
        sender: 'user',
        timestamp: Date.now(),
      });

      setIsTyping(true);

      const response =
        await supportService.resolveChat({
          sessionId: session.sessionId,
          resolved,
        });

      await wait(RESPONSE_DELAY);

      appendMessage({
        id: `resolution-response-${Date.now()}`,
        type: 'TEXT',
        text: response.message,
        sender: 'system',
        timestamp: Date.now(),
      });

      if (response.chatEnabled) {
        setChatMode('FREE_CHAT');

        appendMessage({
          id: `free-chat-enabled-${Date.now()}`,
          type: 'TEXT',
          text: 'Live support enabled.',
          sender: 'system',
          timestamp: Date.now(),
        });

        return;
      }

      setChatMode('RESOLVED');

      await wait(300);

      await loadCategories();
    } catch {
      appendMessage({
        id: `resolve-error-${Date.now()}`,
        type: 'TEXT',
        text: 'Failed to update resolution.',
        sender: 'system',
        timestamp: Date.now(),
        isError: true,
      });
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();

    if (
      !trimmed ||
      isSending ||
      chatMode !== 'FREE_CHAT'
    ) {
      return;
    }

    try {
      setIsSending(true);

      appendMessage({
        id: `user-msg-${Date.now()}`,
        type: 'TEXT',
        text: trimmed,
        sender: 'user',
        timestamp: Date.now(),
      });

      setInputText('');

      setIsTyping(true);

      const response =
        await supportService.sendChatMessage({
          sessionId: session.sessionId,
          message: trimmed,
          userId: user?.sub || '',
          appId: session.appId,
        });

      await wait(350);

      appendMessage({
        id: `bot-msg-${Date.now()}`,
        type: 'TEXT',
        text: response.reply,
        sender: 'bot',
        timestamp: Date.now(),
      });
    } catch (error: any) {
      appendMessage({
        id: `chat-error-${Date.now()}`,
        type: 'TEXT',
        text:
          error?.message ||
          'Failed to send message.',
        sender: 'system',
        timestamp: Date.now(),
        isError: true,
      });
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const renderOptionButtons = (
    message: Message,
  ) => {
    return (
      <View style={styles.optionsContainer}>
        {message.options?.map(option => {
          const isSelected =
            message.selectedOptionId === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              disabled={
                option.disabled ||
                !!message.selectedOptionId
              }
              style={[
                styles.optionButton,
                option.disabled &&
                  styles.optionButtonDisabled,
                isSelected &&
                  styles.optionButtonSelected,
              ]}
              onPress={() => {
                if (
                  option.action === 'CATEGORY'
                ) {
                  handleCategoryPress(option);
                }

                if (
                  option.action === 'QUESTION'
                ) {
                  handleQuestionPress(option);
                }
              }}>
              <Text
                style={[
                  styles.optionButtonText,
                  isSelected &&
                    styles.optionButtonTextSelected,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderResolutionActions = (
    message: Message,
  ) => {
    const isResponded = !!message.selectedOptionId;
    const isResolved =
      message.selectedOptionId === 'yes';
    const isUnresolved =
      message.selectedOptionId === 'no';

    return (
      <View style={styles.resolutionContainer}>
        {(!isResponded || isResolved) && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.resolutionButton,
              styles.resolvedButton,
              isResponded &&
                styles.resolutionButtonDisabled,
            ]}
            disabled={isSending || isResponded}
            onPress={() =>
              handleResolution(true, message.id)
            }>
            <Text
              style={styles.resolvedButtonText}>
              Back to categories
            </Text>
          </TouchableOpacity>
        )}

        {(!isResponded || isUnresolved) && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.resolutionButton,
              styles.notResolvedButton,
              isResponded &&
                styles.resolutionButtonDisabled,
            ]}
            disabled={isSending || isResponded}
            onPress={() =>
              handleResolution(false, message.id)
            }>
            <Text
              style={
                styles.notResolvedButtonText
              }>
              Issue not resolved
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );
  };

  const renderMessage = ({
    item,
  }: {
    item: Message;
  }) => {
    if (item.type === 'OPTIONS') {
      return (
        <View
          style={[
            msgStyles.row,
            msgStyles.botRow,
          ]}>
          <View style={msgStyles.avatar}>
            <BotIcon />
          </View>

          <View
            style={[
              msgStyles.bubble,
              msgStyles.botBubble,
              styles.optionMessageBubble,
            ]}>
            {!!item.text && (
              <Text
                style={[
                  msgStyles.text,
                  msgStyles.botText,
                  styles.optionMessageTitle,
                ]}>
                {item.text}
              </Text>
            )}

            {renderOptionButtons(item)}

            <Text
              style={[
                msgStyles.time,
                msgStyles.botTime,
              ]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      );
    }

    if (item.type === 'RESOLUTION') {
      return renderResolutionActions(item);
    }

    const isBot =
      item.sender === 'bot' ||
      item.sender === 'system';

    return (
      <View
        style={[
          msgStyles.row,
          isBot
            ? msgStyles.botRow
            : msgStyles.userRow,
        ]}>
        {isBot && (
          <View style={msgStyles.avatar}>
            <BotIcon />
          </View>
        )}

        <View
          style={[
            msgStyles.bubble,
            isBot
              ? msgStyles.botBubble
              : msgStyles.userBubble,
            item.isError &&
            msgStyles.errorBubble,
            item.sender === 'system' &&
            msgStyles.systemBubble,
          ]}>
          <Text
            style={[
              msgStyles.text,
              isBot
                ? msgStyles.botText
                : msgStyles.userText,
              item.isError &&
              msgStyles.errorText,
              item.sender === 'system' &&
              msgStyles.systemText,
            ]}>
            {item.text}
          </Text>

          <Text
            style={[
              msgStyles.time,
              isBot
                ? msgStyles.botTime
                : msgStyles.userTime,
            ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const inputDisabled =
    chatMode !== 'FREE_CHAT';

  const inputPlaceholder = useMemo(() => {
    if (chatMode === 'GUIDED') {
      return 'Select an option above...';
    }

    if (chatMode === 'RESOLVED') {
      return 'Support session resolved';
    }

    return 'Type a message...';
  }, [chatMode]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.orderBanner}>
        <OrderInfoIcon />

        <View style={styles.orderBannerInfo}>
          <Text
            style={styles.orderBannerTitle}
            numberOfLines={1}>
            {order.restaurantName || 'Order'}
          </Text>

          <Text
            style={styles.orderBannerSubtitle}
            numberOfLines={1}>
            {order.itemsSummary ||
              `Order #${
                order.externalOrderId ||
                order.orderId.slice(0, 8)
              }`}
          </Text>
        </View>

        <View style={styles.orderBannerStatus}>
          <Text
            style={
              styles.orderBannerStatusText
            }>
            {order.orderStatus?.replace(
              /_/g,
              ' ',
            ) || 'Active'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            `${item.id}-${index}`
          }
          renderItem={renderMessage}
          inverted={false}
          contentContainerStyle={
            styles.messagesList
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <TypingIndicator />
            ) : null
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            style={[
              styles.textInput,
              inputDisabled &&
                styles.disabledInput,
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={inputPlaceholder}
            placeholderTextColor={
              colors.placeholderText
            }
            multiline
            maxLength={1000}
            editable={!inputDisabled}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.sendButton,
              (!inputText.trim() ||
                inputDisabled ||
                isSending) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={
              !inputText.trim() ||
              inputDisabled ||
              isSending
            }>
            {isSending &&
            chatMode === 'FREE_CHAT' ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.cardBackground
                }
              />
            ) : (
              <SendIcon />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },

  orderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border1,
    gap: 10,
  },

  orderBannerInfo: {
    flex: 1,
  },

  orderBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },

  orderBannerSubtitle: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },

  orderBannerStatus: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  orderBannerStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'capitalize',
  },

  chatArea: {
    flex: 1,
  },

  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },

  optionsContainer: {
    gap: 8,
    marginTop: 12,
  },

  optionMessageBubble: {
    width: '88%',
    paddingVertical: 12,
  },

  optionMessageTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },

  optionButton: {
    width: '100%',
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border1,
  },

  optionButtonDisabled: {
    opacity: 0,
    height: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    marginVertical: -4,
  },

  optionButtonSelected: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },

  optionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },

  optionButtonTextSelected: {
    color: colors.secondary,
    fontWeight: '700',
  },

  resolutionContainer: {
    marginVertical: 10,
    gap: 10,
  },

  resolutionButton: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  resolvedButton: {
    backgroundColor: colors.secondaryLight,
  },

  notResolvedButton: {
    backgroundColor: colors.notAvailableBg,
  },

  resolutionButtonDisabled: {
    opacity: 0.7,
  },

  resolvedButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '700',
  },

  notResolvedButtonText: {
    color: colors.notAvailableText,
    fontSize: 14,
    fontWeight: '700',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border1,
    gap: 8,
  },

  textInput: {
    flex: 1,
    backgroundColor: colors.inputFill,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical:
      Platform.OS === 'ios'
        ? 10
        : 8,
    fontSize: 15,
    color: colors.primary,
    maxHeight: 100,
  },

  disabledInput: {
    opacity: 0.7,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    backgroundColor:
      colors.disabledButtonColor,
  },
});

const msgStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  botRow: {
    justifyContent: 'flex-start',
  },

  userRow: {
    justifyContent: 'flex-end',
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },

  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  botBubble: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 4,

    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  userBubble: {
    backgroundColor: colors.secondary,
    borderTopRightRadius: 4,
  },

  systemBubble: {
    backgroundColor:
      colors.secondaryLight,
  },

  text: {
    fontSize: 15,
    lineHeight: 21,
  },

  botText: {
    color: colors.primary,
  },

  userText: {
    color: '#FFFFFF',
  },

  systemText: {
    color: colors.secondary,
  },

  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  botTime: {
    color: colors.gray500,
  },

  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },

  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },

  typingText: {
    fontSize: 13,
    color: colors.gray500,
    fontStyle: 'italic',
  },

  errorBubble: {
    backgroundColor:
      colors.notAvailableBg,

    borderColor:
      colors.notAvailableIndicator,

    borderWidth: 1,
  },

  errorText: {
    color: colors.notAvailableText,
  },
});