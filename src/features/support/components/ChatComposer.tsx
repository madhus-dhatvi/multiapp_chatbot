import React from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { ChatMode } from '../../../types/chat';
import { CHAT_PLACEHOLDERS } from '../../../data/chatConfig';

interface Props {
  chatMode: ChatMode;
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export const ChatComposer = ({
  chatMode,
  value,
  onChangeText,
  onSend,
}: Props) => {
  const disabled = chatMode !== 'FREE_CHAT';

  return (
    <View>
      <TextInput
        value={value}
        editable={!disabled}
        placeholder={CHAT_PLACEHOLDERS[chatMode]}
        onChangeText={onChangeText}
      />

      <TouchableOpacity
        disabled={disabled}
        onPress={onSend}>
        <Text>Send</Text>
      </TouchableOpacity>
    </View>
  );
};