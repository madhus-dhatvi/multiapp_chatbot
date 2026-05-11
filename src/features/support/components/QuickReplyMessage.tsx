import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { ChatMessage } from '../../../types/chat';

interface Props {
  message: ChatMessage;
  onPress: (option: any) => void;
}

export const QuickReplyMessage = ({
  message,
  onPress,
}: Props) => {
  return (
    <View>
      {message.options?.map(option => {
        const isSelected =
          message.selectedOptionId === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            disabled={option.disabled}
            onPress={() => onPress(option)}>
            <Text>
              {option.label}
              {isSelected ? ' ✓' : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};