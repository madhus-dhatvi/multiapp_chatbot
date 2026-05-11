import React from 'react';
import { View, Text } from 'react-native';
import { ChatMessage } from '../../../types/chat';

interface Props {
  message: ChatMessage;
}

export const TextMessage = ({ message }: Props) => {
  return (
    <View>
      <Text>{message.text}</Text>
    </View>
  );
};