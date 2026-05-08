import React, { useState, useRef, useEffect } from 'react';
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
import { orderService } from '../../../api/orderService';
import { RootState } from '../../../store';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>;

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  isError?: boolean;
}

// ── SVG Icons ───────────────────────────────────────────────────────
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

// ── Typing Indicator ────────────────────────────────────────────────
const TypingIndicator = () => (
  <View style={[msgStyles.row, msgStyles.botRow]}>
    <View style={msgStyles.avatar}>
      <BotIcon />
    </View>
    <View style={[msgStyles.bubble, msgStyles.botBubble, msgStyles.typingBubble]}>
      <ActivityIndicator size="small" color={colors.secondary} />
      <Text style={msgStyles.typingText}>Typing...</Text>
    </View>
  </View>
);

// ── Chat Screen ─────────────────────────────────────────────────────
export const ChatScreen = ({ route }: Props) => {
  const { session, order } = route.params;
  const user = useSelector((state: RootState) => state.auth.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Show welcome message on mount
  useEffect(() => {
    if (session.welcomeMessage) {
      setMessages([
        {
          id: 'welcome',
          text: session.welcomeMessage,
          sender: 'bot',
          timestamp: new Date(session.startedAt),
        },
      ]);
    }
  }, [session]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);
    scrollToBottom();

    try {
      // Call the send message API
      const response = await orderService.sendMessage({
        sessionId: session.sessionId,
        message: trimmed,
        userId: user?.sub || '',
        appId: session.appId,
      });

      // Add bot reply to chat
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response.reply,
        sender: 'bot',
        timestamp: new Date(response.timestamp),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      // Show error as a bot message so the user sees it inline
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: error?.message || 'Failed to send message. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isBot = item.sender === 'bot';
    return (
      <View
        style={[
          msgStyles.row,
          isBot ? msgStyles.botRow : msgStyles.userRow,
        ]}>
        {isBot && (
          <View style={msgStyles.avatar}>
            <BotIcon />
          </View>
        )}
        <View
          style={[
            msgStyles.bubble,
            isBot ? msgStyles.botBubble : msgStyles.userBubble,
            item.isError && msgStyles.errorBubble,
          ]}>
          <Text
            style={[
              msgStyles.text,
              isBot ? msgStyles.botText : msgStyles.userText,
              item.isError && msgStyles.errorText,
            ]}>
            {item.text}
          </Text>
          <Text
            style={[
              msgStyles.time,
              isBot ? msgStyles.botTime : msgStyles.userTime,
            ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Order context banner */}
      <View style={styles.orderBanner}>
        <OrderInfoIcon />
        <View style={styles.orderBannerInfo}>
          <Text style={styles.orderBannerTitle} numberOfLines={1}>
            {order.restaurantName || 'Order'}
          </Text>
          <Text style={styles.orderBannerSubtitle} numberOfLines={1}>
            {order.itemsSummary || `Order #${order.externalOrderId || order.orderId.slice(0, 8)}`}
          </Text>
        </View>
        <View style={styles.orderBannerStatus}>
          <Text style={styles.orderBannerStatusText}>
            {order.orderStatus?.replace(/_/g, ' ') || 'Active'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isSending ? <TypingIndicator /> : null}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View style={styles.emptyChatIcon}>
                <BotIcon />
              </View>
              <Text style={styles.emptyChatText}>
                Start your conversation...
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.placeholderText}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}>
            {isSending ? (
              <ActivityIndicator size="small" color={colors.cardBackground} />
            ) : (
              <SendIcon />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

//Styles
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
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyChatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyChatText: {
    fontSize: 14,
    color: colors.gray500,
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
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: colors.primary,
    maxHeight: 100,
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
    backgroundColor: colors.disabledButtonColor,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: colors.secondary,
    borderTopRightRadius: 4,
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
    backgroundColor: colors.notAvailableBg,
    borderColor: colors.notAvailableIndicator,
    borderWidth: 1,
  },
  errorText: {
    color: colors.notAvailableText,
  },
});
